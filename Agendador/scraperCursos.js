const BASE_URL = 'https://www.ipcb.pt';
const PAGINA_CURSOS = `${BASE_URL}/escolas/tecnologia/horarios-calendarios/`;
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const axios = require('axios');
const Curso = require('./models/Curso');
const database = require('./database/basedados');
const { getGFSBucket } = require('./models/gridfs');

const ESCOLA_NOME = "Escola Superior de Tecnologia de Castelo Branco";

function expandirAbreviacoes(nome) {
    return nome
        .replace(/Engª/gi, 'Engenharia')
        .replace(/Eng\./gi, 'Engenharia')
        .replace(/Tec\./gi, 'Tecnologia');
}

function normalizarPrefixo(prefixo) {
    if (/licenciaturas?/i.test(prefixo)) return 'Licenciatura em';
    if (/mestrados?/i.test(prefixo)) return 'Mestrado em';
    if (/CTeSP?/i.test(prefixo)) return 'Curso Técnico Superior Profissional em';
    return prefixo;
}

async function getCursosComLinks() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(PAGINA_CURSOS, { waitUntil: 'domcontentloaded' });

    const html = await page.content();
    const $ = cheerio.load(html);
    const cursos = [];

    $('.tab-content .tab-pane').each((_, tab) => {
        const abaId = $(tab).attr('id');
        let prefixo = $(`button[data-bs-target="#${abaId}"]`).text().trim();
        prefixo = normalizarPrefixo(prefixo);

        $(tab).find('.col-lg-12').each((_, el) => {
            let nomeCurso = $(el).find('.fs-4.fw-bold.mb-2').text().trim();
            nomeCurso = expandirAbreviacoes(nomeCurso);
            const pdfLinks = [];

            $(el).find('a[href$=".pdf"]').each((_, a) => {
                const href = $(a).attr('href');
                const text = $(a).text().toLowerCase();

                if (href && href.endsWith('.pdf')) {
                    let epoca = '';
                    if (href.includes('freq')) epoca = 'Normal';
                    else if (href.includes('exames')) epoca = 'Exame';

                    if (epoca) {
                        pdfLinks.push({
                            nome: href.split('/').pop(),
                            url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                            epoca
                        });
                    }
                }
            });

            if (nomeCurso && pdfLinks.length > 0) {
                cursos.push({ nome: `${prefixo} ${nomeCurso}`, pdfs: pdfLinks });
            }
        });
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

async function fazerUploadParaGridFS(fileBuffer, fileName) {
    return new Promise((resolve, reject) => {
        const gfs = getGFSBucket();
        if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
            return reject(new Error("Buffer inválido ou vazio"));
        }

        const uploadStream = gfs.openUploadStream(fileName);
        uploadStream.on("finish", () => {
            if (!uploadStream.id) return reject(new Error("ID não recebido"));
            resolve(uploadStream.id);
        });
        uploadStream.on("error", (err) => reject(err));
        uploadStream.end(fileBuffer);
    });
}

async function guardarCalendariosDoCurso(nomeCurso, pdfs) {
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
    console.log(`📚 Total de cursos com calendários: ${cursos.length}`);

    for (const curso of cursos) {
        await guardarCalendariosDoCurso(curso.nome, curso.pdfs);
    }

    console.log("✅ Scraping dos calendários dos cursos concluído");
    setTimeout(() => mongoose.connection.close(), 3000);
}

module.exports = { scrapeCalendariosCursos };
