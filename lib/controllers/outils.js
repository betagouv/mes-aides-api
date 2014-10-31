var request = require('superagent');

exports.communes = function(req, res) {
    request
        .get('https://public.opendatasoft.com/api/records/1.0/search')
        .query({
            dataset: 'correspondance-code-insee-code-postal',
            rows: 100,
            q: req.query.codePostal
        })
        .on('error', function() {
            res.send(500);
        })
        .pipe(res);
};
