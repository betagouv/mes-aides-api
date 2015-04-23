'use strict';

module.exports = {
    env: 'development',
    mongo: {
        uri: process.env.MONGODB_URL || 'mongodb://localhost/dds-dev'
    }
};
