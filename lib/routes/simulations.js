var simulations = require('../controllers/simulations');

module.exports = function(api) {
    api.route('/simulations').post(simulations.create);
};
