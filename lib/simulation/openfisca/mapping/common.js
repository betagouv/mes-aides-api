var _ = require('lodash');
var moment = require('moment');

exports.isIndividuValid = isIndividuValid;
exports.getEnfants = getEnfants;

function isIndividuValid(individu, situation) {
    var age = moment(situation.dateDeValeur).diff(moment(individu.dateDeNaissance), 'years');
    var handicap = _.find(individu.situationsPro, { situation: 'handicap' });
    return individu.role != 'enfant' || age <= 25 || handicap;
};

function getEnfants(situation) {
    var enfants = _.filter(situation.individus, function(individu) {
        return isIndividuValid(individu, situation) && individu.role == 'enfant';
    });
    return _.pluck(enfants, '_id');
};
