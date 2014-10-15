module.exports = {
    so: {
        fn: function(logement) {
            var statusOccupationMap = {
                'proprietaireprimoaccedant': 1,
                'proprietaire': 2,
                'locatairehlm': 3,
                'locatairenonmeuble': 4,
                'locatairemeublehotel': 5,
                'gratuit': 6,
                'homeless': 0 // TODO
            };
            var type = logement.type;
            if (type) {
                var statusOccupationId = type;
                if (logement.primoAccedant) statusOccupationId += 'primoaccedant';
                if (logement.locationType) statusOccupationId += logement.locationType;
                return statusOccupationMap[statusOccupationId];
            } 
        }
    },
    loyer: 'loyer',
    depcom: {
        fn: function(logement) { return logement.adresse.codeInsee || null; }
    }
};
