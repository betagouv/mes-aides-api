var simulations = require('../controllers/simulations');

module.exports = function(api) {

    /*
    ** Param injection
    */
    api.param('simulationId', simulations.simulation);

    api.route('/simulations/:simulationId')
        .get(simulations.show);

    api.route('/simulations').post(simulations.create);

    api.route('/simulations/:simulationId/result').get(simulations.result);
    api.route('/simulations/:simulationId/request').get(simulations.request);
};
