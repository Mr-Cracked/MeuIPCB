/*const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.ipcb.pt';
const PAGINA_CURSOS = `${BASE_URL}/escolas/tecnologia/horarios-calendarios/`;

async function getCursosComLinks() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(PAGINA_CURSOS, { waitUntil: 'networkidle2' });
    await new Promise(res => setTimeout(res, 2500)); // Esperar render JS

    // Garantir que tabs estão carregadas
    await page.evaluate(() => {
        document.querySelector('a[href="#nav-licenciaturas"]')?.click();
    });
    await new Promise(res => setTimeout(res, 2500));

    const html = await page.content();
    const $ = cheerio.load(html);
    const cursos = [];

    $('#nav-licenciaturas .fw-6').each((_, el) => {
        const nomeCurso = $(el).text().trim();
        const pdfs = [];

        const links = $(el).next('.list-group')
            .find('a[href$=".pdf"]');

        links.each((i, link) => {
            const href = $(link).attr('href');
            if (href) {
                pdfs.push({
                    nome: href.split('/').pop(),
                    url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                    epoca: i === 0 ? 'Normal' : 'Exame'
                });
            }
        });

        if (nomeCurso && pdfs.length >= 1) {
            cursos.push({ nome: nomeCurso, pdfs });
        }
    });

    await browser.close();

    console.log(`📚 Total de cursos com calendários: ${cursos.length}`);
    cursos.forEach(curso => {
        console.log(`📘 ${curso.nome}`);
        curso.pdfs.forEach(p => console.log(`  📄 ${p.epoca}: ${p.nome}`));
    });

    return cursos;
}

getCursosComLinks();*/


const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const BASE_URL = 'https://www.ipcb.pt';
const PAGINA_CURSOS = `${BASE_URL}/escolas/tecnologia/horarios-calendarios/`;

async function getCursosComLinks() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(PAGINA_CURSOS, { waitUntil: 'networkidle2' });

    // ✅ Clica na aba 'Licenciaturas' para carregar o conteúdo
    try {
        await page.click('a[href="#nav-licenciaturas"]');
        await page.waitForSelector('#nav-licenciaturas .fw-6', { timeout: 10000 });
    } catch (err) {
        console.warn("⚠️ Tab 'Licenciaturas' não apareceu a tempo:", err.message);
    }

    const html = await page.content();
    const $ = cheerio.load(html);
    const cursos = [];

    $('#nav-licenciaturas .fw-6').each((_, h3) => {
        const nomeCurso = $(h3).text().trim();
        const listGroup = $(h3).nextAll('.list-group').first();
        const pdfLinks = [];

        listGroup.find('a[href$=".pdf"]').each((i, el) => {
            const href = $(el).attr('href');
            if (href) {
                pdfLinks.push({
                    nome: href.split('/').pop(),
                    url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
                    epoca: i === 0 ? 'Normal' : 'Exame'
                });
            }
        });

        // Apenas se tiver exatamente 2 PDFs (um para cada época)
        if (nomeCurso && pdfLinks.length === 2) {
            cursos.push({ nome: nomeCurso, pdfs: pdfLinks });
        }
    });

    await browser.close();
    return cursos;
}
getCursosComLinks();

