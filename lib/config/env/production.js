'use strict';

module.exports = {
    env: 'production',
    sessionSecret: process.env.SESSION_SECRET ||
          'fghjdfjkdf785a-jreu',
    mongo: {
        uri: process.env.MONGOHQ_URL || process.env.MONGODB_URL
    }
};
