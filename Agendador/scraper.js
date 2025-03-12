const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const BASE_URL = 'https://www.ipcb.pt';

// Modelo para armazenar informações dos ficheiros
const fileSchema = new mongoose.Schema({
    nome: String,
    url: String,
    data_download: { type: Date, default: Date.now },
});

const File = mongoose.model('File', fileSchema);

// Função para obter os links das páginas de cada escola
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

// Função para obter os links dos ficheiros PDF de cada página de escola
async function getPdfLinks(schoolUrl) {
    try {
        const { data } = await axios.get(schoolUrl);
        const $ = cheerio.load(data);
        const links = [];

        $('a').each((i, elem) => {
            const href = $(elem).attr('href');
            const fileName = path.basename(href).toLowerCase();

            // Filtrar apenas ficheiros com "calendario" no nome
            if (href && href.endsWith('.pdf') && (fileName.includes("calendario") || fileName.includes("calendário-escolar"))) {
                links.push({
                    nome: fileName,
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


// Função para fazer download dos ficheiros PDF
async function downloadFile(file) {
    try {
        const downloadDir = path.resolve(__dirname, "downloads");

        // Criar a pasta "downloads" se não existir
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
            console.log("📂 Criada a pasta 'downloads'");
        }

        const filePath = path.join(downloadDir, file.nome);

        const { data } = await axios({
            url: file.url,
            method: "GET",
            responseType: "stream",
        });

        const writer = fs.createWriteStream(filePath);
        data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on("finish", () => {
                console.log(`✅ Ficheiro ${file.nome} descarregado com sucesso!`);
                resolve(filePath);
            });
            writer.on("error", reject);
        });
    } catch (error) {
        console.error(`❌ Erro ao descarregar o ficheiro ${file.nome}:`, error);
    }
}

const database = require("./database/basedados");

// Função principal para executar o scraper
async function main() {
    await database();

    const SCHOOL_NAME_MAP = {
        "agraria": "Escola Superior Agrária",
        "artes-aplicadas": "Escola Superior de Artes Aplicadas",
        "educacao": "Escola Superior de Educação",
        "gestao": "Escola Superior de Gestão",
        "saude-dr-lopes-dias": "Escola Superior de Saúde Dr. Lopes Dias",
        "tecnologia": "Escola Superior de Tecnologia de Castelo Branco"
    };

    const schoolPages = await getSchoolPages();
    for (const schoolUrl of schoolPages) {
        const pdfLinks = await getPdfLinks(schoolUrl);
        for (const file of pdfLinks) {
            const filePath = await downloadFile(file);
            if (filePath) {
                const Escola = require("./models/Escola"); // Importa o modelo da Escola

                const identificacaoEscola = schoolUrl.replace(BASE_URL, "").split("/").filter(part => part !== "")[1];

                const nomeEscola = SCHOOL_NAME_MAP[identificacaoEscola] || identificacaoEscola;

                console.log("OH CHEFE TA QUI"+ identificacaoEscola);

                // Inserir ou atualizar a escola com o novo calendário
                await Escola.findOneAndUpdate(
                    { nome: nomeEscola },
                    {
                        $addToSet: { calendarios: { nome: file.nome, url: file.url } }
                    },
                    { upsert: true, new: true }
                );

                console.log(`✅ Calendário ${file.nome} armazenado na escola: ${nomeEscola}`);

                console.log(`✅ Ficheiro ${file.nome} armazenado na base de dados.`);
            }
        }
    }

    mongoose.connection.close();
}

main();
