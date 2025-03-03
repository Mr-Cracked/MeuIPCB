

var express = require('express');

const authProvider = require('../auth/AuthProvider');
const { REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } = require('../authConfig');

const router = express.Router();

router.get('/signin', authProvider.login({
    scopes: [],
    redirectUri: REDIRECT_URI,
    successRedirect: 'http://localhost:3001/perfil'  // Redireciona corretamente para o React
}));


router.get('/acquireToken', authProvider.acquireToken({
    scopes: ['User.Read'],
    redirectUri: REDIRECT_URI,
    successRedirect: 'http://localhost:3001/perfil'  // Agora leva diretamente ao perfil do utilizador
}));


router.post('/redirect', authProvider.handleRedirect());

router.get('/signout', authProvider.logout({
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI
}));

router.get('/session', (req, res) => {
    res.json({
        isAuthenticated: req.session.isAuthenticated || false,
        accessToken: req.session.accessToken || "Token não encontrado",
        user: req.session.account || "Utilizador não autenticado"
    });
});


module.exports = router;
