const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const database = require('./database/basedados');
const { getGFSBucket } = require('./models/gridfs');
const Escola = require('./models/Escola');
const Curso = require('./models/Curso');
const puppeteer = require('puppeteer');
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


async function fazerUploadParaGridFS(fileBuffer, fileName) {
    return new Promise((resolve, reject) => {
        const gfs = getGFSBucket();
        if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
            return reject(new Error("Buffer inválido ou vazio"));
        }

        const uploadStream = gfs.openUploadStream(fileName);

        uploadStream.on("finish", () => {
            if (!uploadStream.id) {
                return reject(new Error("ID não recebido após upload"));
            }
            resolve(uploadStream.id);
        });

        uploadStream.on("error", (err) => {
            reject(err);
        });

        uploadStream.end(fileBuffer); // ✅ aqui estava o erro
    });
}




//Guardar ficheiro no MongoDB (GridFS)
async function guardarCalendario(nomeEscola, fileBuffer, fileName) {
    console.log(`📝 Guardando calendário para ${nomeEscola}: ${fileName}`);

    try {
        await apagarCalendariosAntigos(nomeEscola)
        const gfsBucket = getGFSBucket();
        if (!gfsBucket) throw new Error("GridFSBucket não inicializado");

        if (!fileBuffer || fileBuffer.length === 0) {
            throw new Error("Buffer inválido ou vazio");
        }

        const fileId = await fazerUploadParaGridFS(fileBuffer, fileName);

        await Escola.findOneAndUpdate(
            { nome: nomeEscola },
            { $set: { calendarios: [{ fileId, nome: fileName }] } },
            { upsert: true }
        );

        console.log(`✅ Ficheiro "${fileName}" guardado para ${nomeEscola}`);
    } catch (err) {
        console.error(`❌ Erro ao guardar o calendário: ${err.message}`);
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
async function scrapeCalendariosEscolas() {
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

}



// 🛑🛑🛑🛑CURSOS


const PAGINA_CURSOS = `${BASE_URL}/escolas/tecnologia/horarios-calendarios/`;
const ESCOLA_NOME = "Escola Superior de Tecnologia de Castelo Branco";


async function getCursosComLinks() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(PAGINA_CURSOS, { waitUntil: 'domcontentloaded' });
    await new Promise(res => setTimeout(res, 2000));

    const html = await page.content();
    const $ = cheerio.load(html);
    const cursos = [];

    $('.tab-pane').each((_, el) => {
        const nomeCurso = $(el).find('h3').first().text().trim();
        const pdfLinks = [];

        $(el).find('a[href$=".pdf"]').each((i, link) => {
            const href = $(link).attr('href');
            if (href) {
                pdfLinks.push({
                    nome: href.split('/').pop(),
                    url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                    epoca: i === 0 ? 'Normal' : 'Exame'
                });
            }
        });

        if (nomeCurso && pdfLinks.length > 0) {
            cursos.push({
                nome: nomeCurso,
                pdfs: pdfLinks.slice(0, 2) // Apenas 2 por curso: normal e exame
            });
        }
    });

    await browser.close();
    return cursos;
}


async function apagarCalendariosAntigosCursos(nomeCurso) {
    try {
        const curso = await Curso.findOne({ nome: nomeCurso });
        if (curso && curso.calendarios.length > 0) {
            const gfsBucket = getGFSBucket();
            for (const cal of curso.calendarios) {
                if (cal.fileId) {
                    try {
                        await gfsBucket.delete(new mongoose.Types.ObjectId(cal.fileId));
                        console.log(`🗑️ Apagado antigo: ${cal.fileId}`);
                    } catch (err) {
                        console.error(`⚠️ Erro ao apagar antigo ${cal.fileId}: ${err.message}`);
                    }
                }
            }
            await Curso.updateOne({ nome: nomeCurso }, { $unset: { calendarios: 1 } });
        }
    } catch (err) {
        console.error(`❌ Erro ao apagar antigos de ${nomeCurso}:`, err.message);
    }
}


async function guardarCalendariosDoCurso(nomeCurso, pdfs) {
    const gfsBucket = getGFSBucket();
    const calendarios = [];

    await apagarCalendariosAntigosCursos(nomeCurso);

    for (const cal of pdfs) {
        try {
            const res = await axios.get(cal.url, { responseType: "arraybuffer" });
            const buffer = Buffer.from(res.data);
            const fileId = await fazerUploadParaGridFS(buffer, cal.nome);

            calendarios.push({
                epoca: cal.epoca,
                fileId,
                data_download: new Date()
            });

            console.log(`✅ Guardado [${cal.epoca}] ${cal.nome} para ${nomeCurso}`);
        } catch (err) {
            console.error(`❌ Erro ao guardar ${cal.nome}: ${err.message}`);
        }
    }

    await Curso.findOneAndUpdate(
        { nome: nomeCurso },
        {
            Escola: ESCOLA_NOME,
            nome: nomeCurso,
            calendarios
        },
        { upsert: true }
    );
}

async function scrapeCalendariosCursos() {
    await database();
    console.log("✅ Conectado ao MongoDB");

    const cursos = await getCursosComLinks();
    console.log(`📚 Encontrados ${cursos.length} cursos com calendários.`);

    for (const curso of cursos) {
        await guardarCalendariosDoCurso(curso.nome, curso.pdfs);
    }

    console.log("✅ Scraping dos calendários dos cursos concluído");
    setTimeout(() => mongoose.connection.close(), 3000);
}


module.exports = {scrapeCalendariosEscolas, scrapeCalendariosCursos};
