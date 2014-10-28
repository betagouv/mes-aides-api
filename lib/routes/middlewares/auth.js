exports.ensureLoggedIn = function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) return res.send(401);
    next();
};

exports.isAdmin = function(req, res, next) {
    if (!req.user.isAdmin) return res.send(403);
    next();
};
