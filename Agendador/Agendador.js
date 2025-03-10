const database = require('./database/basedados');
const fs = require("fs");
const mongoose = require("mongoose");
const Aluno = require("./models/Aluno");

require("dotenv").config();



database().then(async () => {
    try {
        // Lê os dados do JSON
        const data = JSON.parse(fs.readFileSync("Dados.json", "utf-8"));

        console.log("📌 Dados a inserir:", JSON.stringify(data, null, 2));

        // Limpa a coleção antes de inserir (evita duplicação)
        await Aluno.deleteMany({});
        console.log("🗑️ Coleção limpa!");

        // Inserir os dados no MongoDB
        const result = await Aluno.create(data);

        console.log("✅ Dados inseridos com sucesso!", result);

    } catch (error) {
        console.error("❌ Erro ao importar dados:", error);
    } finally {
        await mongoose.connection.close();
    }
});

