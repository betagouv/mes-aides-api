var moment = require('moment');


exports.map = function(date) {
    return moment(date).format('YYYY-MM');
};
