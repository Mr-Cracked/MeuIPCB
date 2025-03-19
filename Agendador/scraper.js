const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const database = require('./database/basedados');
const { getGFSBucket } = require('./models/gridfs');
const Escola = require('./models/Escola');
let contadorGuardados = 0;

const BASE_URL = 'https://www.ipcb.pt';

// Mapeamento dos nomes das escolas
const SCHOOL_NAME_MAP = {
    "agraria": "Escola Superior Agrária",
    "artes-aplicadas": "Escola Superior de Artes Aplicadas",
    "educacao": "Escola Superior de Educação",
    "gestao": "Escola Superior de Gestão",
    "saude-dr-lopes-dias": "Escola Superior de Saúde Dr. Lopes Dias",
    "tecnologia": "Escola Superior de Tecnologia de Castelo Branco"
};


//Obter as páginas das escolas
async function getSchoolPages() {
    try {
        const { data } = await axios.get(`${BASE_URL}/estudar/academicos/horarios-e-calendarios/`);
        const $ = cheerio.load(data);
        const links = [];

        $('a').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && href.includes('/escolas/') && href.includes('/horarios-calendarios/')) {
                links.push(`${BASE_URL}${href}`);
            }
        });

        return links;
    } catch (error) {
        console.error('❌ Erro ao obter links das escolas:', error);
        return [];
    }
}

// Obter os links dos PDFs
async function getPdfLinks(schoolUrl) {
    try {
        const { data } = await axios.get(schoolUrl);
        const $ = cheerio.load(data);
        const links = [];

        $('a').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && href.endsWith('.pdf') && (href.includes("calendario") || href.includes("calendário-escolar"))) {
                links.push({
                    nome: href.split('/').pop(),
                    url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                });
            }
        });

        console.log(`📥 Encontrados ${links.length} calendários em ${schoolUrl}`);
        return links;
    } catch (error) {
        console.error(`❌ Erro ao obter PDFs da escola ${schoolUrl}:`, error);
        return [];
    }
}

//Apagar calendários antigos
async function apagarCalendariosAntigos(nomeEscola) {
    try {
        const escola = await Escola.findOne({ nome: nomeEscola });

        if (escola && escola.calendarios.length > 0) {
            const gfsBucket = getGFSBucket();

            for (let calendario of escola.calendarios) {
                if (calendario.fileId) {
                    try {
                        await gfsBucket.delete(new mongoose.Types.ObjectId(calendario.fileId));
                        console.log(`🗑️ Ficheiro ${calendario.fileId} apagado do GridFS`);
                    } catch (err) {
                        if (err.message.includes('not found')) {
                            console.log(`⚠️ O ficheiro ${calendario.fileId} já não existe no GridFS.`);
                        } else {
                            console.error(`❌ Erro ao apagar ficheiro ${calendario.fileId}:`, err);
                        }
                    }
                }
            }

            // 🔄 Remover os calendários da escola para evitar duplicações
            await Escola.updateOne({ nome: nomeEscola }, { $unset: { calendarios: 1 } });
            console.log(`🗑️ Todos os calendários antigos apagados para: ${nomeEscola}`);
        }
    } catch (error) {
        console.error('❌ Erro ao apagar calendários antigos:', error);
    }
}


async function fazerUploadParaGridFS(gfsBucket, fileBuffer, fileName) {
    return new Promise((resolve, reject) => {
        console.log(`🔄 Iniciando upload de "${fileName}" para GridFS...`);
        const uploadStream = gfsBucket.openUploadStream(fileName);
        uploadStream.end(fileBuffer);

        uploadStream.on('finish', function (file) {
            if (!file || !file._id) {
                console.error(`❌ Erro: Upload do ficheiro "${fileName}" falhou, ID não recebido.`);
                return reject(null);
            }
            console.log(`✅ Upload concluído: "${fileName}" - ID: ${file._id}`);
            resolve(file._id);
        });

        uploadStream.on('error', (error) => {
            console.error(`❌ Erro ao armazenar o ficheiro "${fileName}" no GridFS:`, error);
            reject(null);
        });
    });
}


//Guardar ficheiro no MongoDB (GridFS)
async function guardarCalendario(nomeEscola, fileBuffer, fileName) {
    console.log(`📝 Guardando calendário para ${nomeEscola}: ${fileName}`);

    try {
        const gfsBucket = getGFSBucket();
        if (!gfsBucket) {
            throw new Error('🚨 Erro crítico: GridFSBucket ainda não foi inicializado.');
        }

        // Apagar calendários antigos antes de adicionar novos
        await apagarCalendariosAntigos(nomeEscola);

        // Verificar se o ficheiro já existe no GridFS
        const existingFiles = await gfsBucket.find({ filename: fileName }).toArray();
        let fileId;
        if (existingFiles.length > 0) {
            console.log(`⚠️ O ficheiro "${fileName}" já existe no GridFS. Não será armazenado novamente.`);
            fileId = existingFiles[0]._id;
        } else {
            // 🔄 Criar um stream de upload para o MongoDB
            fileId = await fazerUploadParaGridFS(gfsBucket, fileBuffer, fileName);

            if (!fileId) {
                console.error(`❌ Erro crítico: Upload falhou para "${fileName}". Tentando novamente...`);
                fileId = await fazerUploadParaGridFS(gfsBucket, fileBuffer, fileName); // Segunda tentativa
            }

            if (!fileId) {
                throw new Error(`❌ Falha crítica: Upload do ficheiro "${fileName}" não recebeu um ID mesmo após tentativa extra.`);
            }
        }

        // Verifica se o ficheiro já está na escola antes de atualizar
        const escola = await Escola.findOne({ nome: nomeEscola });
        if (escola && escola.calendarios.some(cal => cal.fileId.equals(fileId))) {
            console.log(`⚠️ O ficheiro "${fileName}" já está associado à escola ${nomeEscola}.`);
            return;
        }

        // 📝 Atualiza a escola para referenciar o novo ficheiro
        await Escola.findOneAndUpdate(
            { nome: nomeEscola },
            { $set: { calendarios: [{ fileId, nome: fileName }] } }, // ✅ Usa $set para evitar duplicações
            { upsert: true }
        );

        console.log(`✅ Ficheiro "${fileName}" referenciado na escola ${nomeEscola}`);

    } catch (error) {
        console.error('❌ Erro ao guardar o calendário:', error);
    }
}


//Download do ficheiro PDF
async function baixarCalendario(nomeEscola, file) {
    try {
        console.log(`📥 A baixar calendário ${file.nome} de ${nomeEscola}...`);
        const response = await axios.get(file.url, { responseType: 'arraybuffer' });

        await guardarCalendario(nomeEscola, response.data, file.nome);
    } catch (error) {
        console.error(`❌ Erro ao baixar calendário de ${nomeEscola}:`, error);
    }
}

//Função principal do scraper
async function scrapeCalendarios() {
    await database();
    console.log('✅ Conectado ao MongoDB!');

    console.log('🔄 Iniciando Scraper de Calendários...');
    const schoolPages = await getSchoolPages();

    const escolaUltimoFicheiro = {}; // Guardar apenas o último ficheiro por escola

    for (const schoolUrl of schoolPages) {
        const pdfLinks = await getPdfLinks(schoolUrl);
        const identificacaoEscola = schoolUrl.replace(BASE_URL, "").split("/").filter(part => part !== "")[1];
        const nomeEscola = SCHOOL_NAME_MAP[identificacaoEscola] || identificacaoEscola;

        if (pdfLinks.length > 0) {
            escolaUltimoFicheiro[nomeEscola] = pdfLinks[pdfLinks.length - 1]; // Apenas o último ficheiro
        }
    }

    console.log(`📥 ${Object.keys(escolaUltimoFicheiro).length} escolas com calendários encontrados.`);

    // Processa apenas um ficheiro por escola
    for (const [nomeEscola, file] of Object.entries(escolaUltimoFicheiro)) {
        await baixarCalendario(nomeEscola, file);
    }

    console.log('✅ Todos os ficheiros foram processados.');

    // 🛑 Só fechar conexão quando tudo estiver terminado
    setTimeout(async () => {
        console.log('🔄 A fechar conexão MongoDB...');
        try {
            await mongoose.connection.close();
            console.log('✅ Conexão com MongoDB fechada com sucesso.');
        } catch (err) {
            console.error('❌ Erro ao fechar conexão com MongoDB:', err);
        }
    }, 3000);
}




module.exports = {scrapeCalendarios};
