const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gfsBucket = null;

// Apenas inicializa uma vez, quando a conexão estiver pronta
mongoose.connection.once('open', () => {
    if (!gfsBucket) {
        console.log('✅ GridFSBucket inicializado.');
        gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'files' });
    }

});
const getGFSBucket = () => {
    if (!gfsBucket) {
        console.error('❌ Erro: GridFSBucket ainda não foi inicializado.');
        throw new Error('GridFSBucket não está pronto.');
    }
    return gfsBucket;
};

module.exports = { getGFSBucket };
