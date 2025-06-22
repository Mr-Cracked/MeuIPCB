const Aluno = require("../models/Aluno");

async function isAluno(req, res, next) {

    const email = req.session.account?.username;

    const aluno = await Aluno.findOne({email: email});

    console.log(aluno);

    if (!aluno) {
        return res.status(401).json({message: "Não é aluno"});
    }

    next();
}

module.exports = { isAluno };