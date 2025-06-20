const Role = require("../models/Role");

async function isServicoEscolar(req, res, next) {

    const email = req.session.account?.username;

    const utilizador = await Role.findOne({email: email});

    if (!utilizador) {
        return res.status(401).json({message: "Não tem permissões"});
    }

    next();
}

module.exports = { isServicoEscolar };