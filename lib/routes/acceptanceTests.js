var acceptanceTests = require('../controllers/acceptanceTests');
var auth = require('./middlewares/auth');

module.exports = function(api) {

    /*
    ** Param injection
    */
    api.param('testId', acceptanceTests.find);

    api.use('/acceptance-tests', auth.ensureLoggedIn);

    /*
    ** Routes
    */
    api.route('/acceptance-tests')
        .get(acceptanceTests.list)
        .post(acceptanceTests.create);

    api.route('/acceptance-tests/:testId')
        .get(acceptanceTests.show)
        .put(acceptanceTests.update)
        .delete(acceptanceTests.delete);

};
