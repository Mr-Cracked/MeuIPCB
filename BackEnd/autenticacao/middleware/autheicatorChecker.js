function isAuthenticated(req, res, next) {
    if (!req.session || !req.session.isAuthenticated) {
        return res.status(401).json({ message: "Utilizador não autenticado" });
    }

    next();
}
module.exports = { isAuthenticated };