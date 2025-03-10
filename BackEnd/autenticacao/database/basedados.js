const mongoose = require('mongoose');
require('dotenv').config(); // Para carregar variáveis de ambiente

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://user:amarelo123@meuipcb.0t4ml.mongodb.net/?retryWrites=true&w=majority&appName=MeuIPCB';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Conectado à base de dados!");
    } catch (err) {
        console.error("❌ Erro ao conectar à base de dados:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
