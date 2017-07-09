var simulations = require('../controllers/simulations');

module.exports = function(api) {

    /*
    ** Param injection
    */
    api.param('simulationId', simulations.simulation);

    api.route('/situations/:situationId')
        .get(simulations.show);

    api.route('/simulations').post(simulations.create);
};
