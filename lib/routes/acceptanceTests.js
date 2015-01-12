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
        if (req.user.isAdmin || (acceptanceTest.user && (req.user.id === acceptanceTest.user.id))) return next();
        res.status(403).end();
    };

    /*
    ** Routes
    */
    api.route('/acceptance-tests')
        .all(auth.ensureLoggedIn)
        .get(acceptanceTests.list)
        .post(acceptanceTests.create);

    api.route('/acceptance-tests/public')
        .get(acceptanceTests.list);

    api.route('/acceptance-tests/keywords')
        .get(acceptanceTests.showKeywords);

    api.route('/acceptance-tests/organizations')
        .get(acceptanceTests.showOrganizations);

    api.route('/acceptance-tests/:testId')
        .all(auth.ensureLoggedIn)
        .get(acceptanceTests.show)
        .put(allowUpdate, acceptanceTests.update)
        .delete(allowUpdate, acceptanceTests.delete);

    api.route('/acceptance-tests/:testId/validation')
        .all(auth.isAdmin)
        .put(acceptanceTests.updateValidation);

    api.route('/acceptance-tests/:testId/executions')
        .all(auth.ensureLoggedIn)
        .get(acceptanceTestExecutions.list)
        .post(auth.isAdmin, acceptanceTestExecutions.create);

    api.route('/acceptance-tests/:testId/timeline')
        .all(auth.ensureLoggedIn)
        .get(acceptanceTests.showTimeline);

};
