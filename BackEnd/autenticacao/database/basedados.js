const mongoose = require('mongoose');
require('dotenv').config(); // Para carregar variáveis de ambiente

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://user:amarelo123@meuipcb.0t4ml.mongodb.net/?retryWrites=true&w=majority&appName=MeuIPCB';

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('✅ Conexão com MongoDB já ativa. Evitando reconexão.');
        return;
    }

    try {
        await mongoose.connect(MONGO_URI, {
            dbName: "MeuIPCB",
        });

        isConnected = true;
        console.log('✅ Conectado ao MongoDB!');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;


