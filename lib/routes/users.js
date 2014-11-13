var users = require('../controllers/users');
var auth = require('./middlewares/auth');

module.exports = function(api) {

    /*
    ** Param injection
    */
    api.param('userId', users.user);

    api.use('/users', auth.ensureLoggedIn, auth.isAdmin);

    /*
    ** Routes
    */
    api.route('/users/:userId')
        .get(users.show)
        .put(users.update)
        .delete(users.delete);

    api.route('/users')
        .post(users.create)
        .get(users.list);

};
