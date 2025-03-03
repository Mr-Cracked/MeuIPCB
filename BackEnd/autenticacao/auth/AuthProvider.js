const msal = require('@azure/msal-node');
const axios = require('axios');

const { msalConfig } = require('../authConfig');

class AuthProvider {
    msalConfig;
    cryptoProvider;

    constructor(msalConfig) {
        this.msalConfig = msalConfig;
        this.cryptoProvider = new msal.CryptoProvider(); // Utilizado para operações de criptografia, como gerar PKCE codes
    }

    login(options = {}) {
        return async (req, res, next) => {
            // Codifica informações do estado atual da aplicação, como a página de redirecionamento após sucesso
            const state = this.cryptoProvider.base64Encode(
                JSON.stringify({
                    successRedirect: options.successRedirect || '/', // Página padrão para redirecionar após login
                })
            );

            // Parâmetros necessários para obter a URL de autorização
            const authCodeUrlRequestParams = {
                state: state,
                scopes: options.scopes || [], // Scopes de permissões para o acesso solicitado
                redirectUri: options.redirectUri, // URI para redirecionar após autenticação
            };

            // Parâmetros necessários para trocar o código de autorização por tokens
            const authCodeRequestParams = {
                state: state,
                scopes: options.scopes || [],
                redirectUri: options.redirectUri,
            };

            // Verifica se os metadados de descoberta estão configurados; caso contrário, busca-os para otimizar desempenho
            if (!this.msalConfig.auth.cloudDiscoveryMetadata || !this.msalConfig.auth.authorityMetadata) {
                const [cloudDiscoveryMetadata, authorityMetadata] = await Promise.all([
                    this.getCloudDiscoveryMetadata(this.msalConfig.auth.authority),
                    this.getAuthorityMetadata(this.msalConfig.auth.authority),
                ]);

                this.msalConfig.auth.cloudDiscoveryMetadata = JSON.stringify(cloudDiscoveryMetadata);
                this.msalConfig.auth.authorityMetadata = JSON.stringify(authorityMetadata);
            }

            const msalInstance = this.getMsalInstance(this.msalConfig);

            // Inicia o fluxo de autorização redirecionando para a URL de autenticação
            return this.redirectToAuthCodeUrl(
                authCodeUrlRequestParams,
                authCodeRequestParams,
                msalInstance
            )(req, res, next);
        };
    }

    acquireToken(options = {}) {
        return async (req, res, next) => {
            try {
                const msalInstance = this.getMsalInstance(this.msalConfig);

                // Deserializa o cache de tokens da sessão, se existir
                if (req.session.tokenCache) {
                    msalInstance.getTokenCache().deserialize(req.session.tokenCache);
                }

                // Obtém um token de forma silenciosa, utilizando o cache existente
                const tokenResponse = await msalInstance.acquireTokenByCode(authCodeRequest, req.body);

                if (!tokenResponse.accessToken) {
                    console.error("Erro: Token de acesso não foi recebido!");
                    return next(new Error("Erro ao obter token de acesso do Microsoft Identity."));
                }

                // Armazena os tokens na sessão corretamente
                req.session.tokenCache = msalInstance.getTokenCache().serialize();
                req.session.idToken = tokenResponse.idToken;
                req.session.accessToken = tokenResponse.accessToken; // ESSENCIAL PARA USAR NO `fetch.js`
                req.session.account = tokenResponse.account;
                req.session.isAuthenticated = true;

                console.log("Login bem-sucedido! Token armazenado na sessão.");


                res.redirect(options.successRedirect); // Redireciona para a página de sucesso após adquirir o token
            } catch (error) {
                if (error instanceof msal.InteractionRequiredAuthError) {
                    // Se for necessária interação do utilizador, inicia o fluxo de login novamente
                    return this.login({
                        scopes: options.scopes || [],
                        redirectUri: options.redirectUri,
                        successRedirect: options.successRedirect || '/',
                    })(req, res, next);
                }

                next(error); // Passa outros erros para o próximo middleware
            }
        };
    }

    handleRedirect(options = {}) {
        return async (req, res, next) => {
            if (!req.body || !req.body.state) {
                return next(new Error('Erro: resposta não encontrada'));
            }

            // Prepara a solicitação para trocar o código de autorização por tokens
            const authCodeRequest = {
                ...req.session.authCodeRequest,
                code: req.body.code, // Código de autorização recebido
                codeVerifier: req.session.pkceCodes.verifier, // Verificador PKCE gerado previamente
            };

            try {
                const msalInstance = this.getMsalInstance(this.msalConfig);

                // Deserializa o cache de tokens, se existir
                if (req.session.tokenCache) {
                    msalInstance.getTokenCache().deserialize(req.session.tokenCache);
                }

                // Troca o código de autorização por tokens
                const tokenResponse = await msalInstance.acquireTokenByCode(authCodeRequest, req.body);

                // Atualiza a sessão com os novos tokens adquiridos
                req.session.tokenCache = msalInstance.getTokenCache().serialize();
                req.session.idToken = tokenResponse.idToken;
                req.session.account = tokenResponse.account;
                req.session.isAuthenticated = true;

                // Redireciona para a página definida no estado inicial
                const state = JSON.parse(this.cryptoProvider.base64Decode(req.body.state));
                res.redirect(state.successRedirect);
            } catch (error) {
                next(error);
            }
        };
    }

    logout(options = {}) {
        return (req, res, next) => {
            // Constrói a URL de logout com redirecionamento opcional após o logout
            let logoutUri = `${this.msalConfig.auth.authority}/oauth2/v2.0/`;

            if (options.postLogoutRedirectUri) {
                logoutUri += `logout?post_logout_redirect_uri=${options.postLogoutRedirectUri}`;
            }

            req.session.destroy(() => {
                res.redirect(logoutUri); // Redireciona o utilizador para encerrar a sessão com o Azure AD
            });
        };
    }

    // Cria uma instância do MSAL ConfidentialClientApplication com a configuração fornecida
    getMsalInstance(msalConfig) {
        return new msal.ConfidentialClientApplication(msalConfig);
    }

    // Prepara os parâmetros e inicia o fluxo de autorização redirecionando para a URL de autenticação
    redirectToAuthCodeUrl(authCodeUrlRequestParams, authCodeRequestParams, msalInstance) {
        return async (req, res, next) => {
            // Gera códigos PKCE (verificador e desafio) para o fluxo de autorização
            const { verifier, challenge } = await this.cryptoProvider.generatePkceCodes();

            // Armazena os códigos PKCE e o método na sessão
            req.session.pkceCodes = {
                challengeMethod: 'S256',
                verifier: verifier,
                challenge: challenge,
            };

            // Prepara os parâmetros da URL de autenticação
            req.session.authCodeUrlRequest = {
                ...authCodeUrlRequestParams,
                responseMode: msal.ResponseMode.FORM_POST, // Modo de resposta recomendado para clientes confidenciais
                codeChallenge: req.session.pkceCodes.challenge,
                codeChallengeMethod: req.session.pkceCodes.challengeMethod,
            };

            // Prepara os parâmetros para a troca do código de autorização por tokens
            req.session.authCodeRequest = {
                ...authCodeRequestParams,
                code: '',
            };

            try {
                // Obtém a URL de autenticação e redireciona o utilizador para ela
                const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(req.session.authCodeUrlRequest);
                res.redirect(authCodeUrlResponse);
            } catch (error) {
                next(error);
            }
        };
    }

    // Obtém os metadados de descoberta em nuvem do endpoint de descoberta
    async getCloudDiscoveryMetadata(authority) {
        const endpoint = 'https://login.microsoftonline.com/common/discovery/instance';

        try {
            const response = await axios.get(endpoint, {
                params: {
                    'api-version': '1.1',
                    'authorization_endpoint': `${authority}/oauth2/v2.0/authorize`,
                },
            });

            return await response.data;
        } catch (error) {
            throw error;
        }
    }

    // Obtém os metadados do OIDC do endpoint OpenID
    async getAuthorityMetadata(authority) {
        const endpoint = `${authority}/v2.0/.well-known/openid-configuration`;

        try {
            const response = await axios.get(endpoint);
            return await response.data;
        } catch (error) {
            console.log(error);
        }
    }
}

const authProvider = new AuthProvider(msalConfig);

module.exports = authProvider;
