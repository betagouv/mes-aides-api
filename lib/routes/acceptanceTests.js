var acceptanceTests = require('../controllers/acceptanceTests');
var acceptanceTestExecutions = require('../controllers/acceptanceTestExecutions');
var auth = require('./middlewares/auth');

module.exports = function(api) {

    /*
    ** Param injection
    */
    api.param('testId', acceptanceTests.find);

    api.use('/acceptance-tests', auth.ensureLoggedIn);

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
        .get(acceptanceTests.list)
        .post(acceptanceTests.create);

    api.route('/acceptance-tests/validated')
        .get(acceptanceTests.listValidated);

    api.route('/acceptance-tests/error')
        .get(acceptanceTests.listError);

    api.route('/acceptance-tests/pending')
        .get(acceptanceTests.listPending);

    api.route('/acceptance-tests/mine')
        .get(acceptanceTests.listMine);

    api.route('/acceptance-tests/:testId')
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
