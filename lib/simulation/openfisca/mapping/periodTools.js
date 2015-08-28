var moment = require('moment');


exports.toOpenFiscaFormat = function(date) {
    return moment(date).format('YYYY-MM');
};
