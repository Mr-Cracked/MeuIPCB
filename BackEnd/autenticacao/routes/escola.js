const express = require("express");
const { getGFSBucket } = require('../models/gridfs');
const router = express.Router();

router.get('/pdf/:id', async (req, res) => {
    const fileId = req.params.id;
    const gfs = getGFSBucket();

    try {
        const _id = new mongoose.Types.ObjectId(fileId);
        const file = await gfs.find({ _id }).toArray();

        if (!file || file.length === 0) {
            return res.status(404).json({ error: 'Ficheiro não encontrado' });
        }

        res.set('Content-Type', 'application/pdf');

        const readStream = gfs.openDownloadStream(_id);
        readStream.pipe(res);

    } catch (err) {
        console.error('❌ Erro ao carregar PDF:', err.message);
        res.status(500).json({ error: 'Erro ao carregar PDF' });
    }
});

module.exports = router;