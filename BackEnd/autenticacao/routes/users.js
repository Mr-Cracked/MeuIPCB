var express = require('express');
var router = express.Router();

var fetch = require('../fetch');

var { GRAPH_ME_ENDPOINT } = require('../authConfig');

// custom middleware to check auth state
function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }

    next();
};

router.get('/id',
    isAuthenticated, // check if user is authenticated
    async function (req, res, next) {
        console.log("OLAAA  ",req);
        res.render('id', { idTokenClaims: req.session.account.idTokenClaims });
    }
);

router.get('/profile', isAuthenticated, async function (req, res) {
    console.log("AYO AQUI CARALHO CVBAHCVAECJA", req.session);
    try {
        if (!req.session.account) {
            console.error("Utilizador não autenticado.");
            return res.status(401).json({ error: "Utilizador não autenticado." });
        }

        console.log("Dados do utilizador encontrados na sessão:", req.session.account);
        res.json({
            displayName: req.session.account.name,
            email: req.session.account.username,
            tenantId: req.session.account.tenantId,
            idTokenClaims: req.session.account.idTokenClaims
        });
    } catch (error) {
        console.error("Erro ao obter perfil:", error.message);
        res.status(500).json({ error: "Erro ao obter perfil do utilizador", details: error.message });
    }
});




module.exports = router;
