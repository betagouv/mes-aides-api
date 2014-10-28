'use strict';

module.exports = {
    port: process.env.PORT || 5000,
    sessionSecret: 'blablablabla',
    openfiscaApi: process.env.OPENFISCA_URL,
    cerfaFormFillerApi: process.env.CERFA_FORM_FILLER_URL
};
