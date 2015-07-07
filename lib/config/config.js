module.exports = {
    openfiscaApi        : process.env.OPENFISCA_URL         || 'http://localhost:2000',
    cerfaFormFillerApi  : process.env.CERFA_FORM_FILLER_URL || 'http://localhost:9001',
    sessionSecret       : process.env.SESSION_SECRET        || 'fghjdfjkdf785a-jreu',
    mongo: {
        uri: process.env.MONGODB_URL || 'mongodb://localhost/dds'
    }
};
