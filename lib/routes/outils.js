var outils = require('../controllers/outils');

module.exports = function(api) {

    api.route('/outils/communes').get(outils.communes);

};
