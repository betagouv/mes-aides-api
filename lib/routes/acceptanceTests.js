var acceptanceTests = require('../controllers/acceptanceTests');
var acceptanceTestExecutions = require('../controllers/acceptanceTestExecutions');
var auth = require('./middlewares/auth');

module.exports = function(api) {

    /*
    ** Param injection
    */
    api.param('testId', acceptanceTests.find);

    /*
    ** Security
    */
    var allowUpdate = function(req, res, next) {
        var acceptanceTest = req.acceptanceTest;
        if (req.user.isAdmin || (acceptanceTest.createdBy && (req.user.id === acceptanceTest.createdBy.id))) return next();
        res.status(403).end();
    };

    /*
    ** Routes
    */
    api.route('/acceptance-tests')
        .all(auth.ensureLoggedIn)
        .get(acceptanceTests.list)
        .post(acceptanceTests.create);

    api.route('/acceptance-tests/validated')
        .get(acceptanceTests.listValidated);

    api.route('/acceptance-tests/public')
        .get(acceptanceTests.listValidated);

    // Alias: À supprimer quand la migration UI aura été effectuée

    api.route('/acceptance-tests/rejected')
        .all(auth.ensureLoggedIn)
        .get(acceptanceTests.listRejected);

    api.route('/acceptance-tests/pending')
        .all(auth.ensureLoggedIn)
        .get(acceptanceTests.listPending);

    api.route('/acceptance-tests/mine')
        .all(auth.ensureLoggedIn)
        .get(acceptanceTests.listMine);

    api.route('/acceptance-tests/:testId')
        .all(auth.ensureLoggedIn)
        .get(acceptanceTests.show)
        .put(allowUpdate, acceptanceTests.update)
        .delete(allowUpdate, acceptanceTests.delete);

    api.route('/acceptance-tests/:testId/validation')
        .all(auth.isAdmin)
        .put(acceptanceTests.validate);

    api.route('/acceptance-tests/:testId/executions')
        .all(auth.ensureLoggedIn)
        .get(acceptanceTestExecutions.list)
        .post(acceptanceTestExecutions.create);

};
