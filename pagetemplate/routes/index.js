var express = require('express');
var _ = require('lodash');
var watson = require('watson-developer-cloud');

var router = express.Router();
// Authentication module.
var auth = require('http-auth');
var basic = auth.basic({
    realm: "Protected",
    file: __dirname + "/../users.htpasswd"
});

var conversation = watson.conversation({
    username: process.env.WDC_USERNAME,
    password: process.env.WDC_PASSWORD,
    version: 'v1',
    version_date: '2016-09-20'
});
var workspaceId = process.env.WDC_WORKSPACE_ID;


/* GET home page. protected*/
router.get('/', auth.connect(basic), function(req, res, next) {
    var defaults = require("../public/profiles/default.json");
    var templateValues = {}; // todo load override values (e.g. locale)
    _.defaults(templateValues, defaults);


    res.render('index', templateValues);
});


router.get('/watson-chat', function(req, res) {
    var payload = {};


    // we simply pass the context with the query param
    var context = JSON.parse (req.query.context || {});

    conversation.message({
        workspace_id: workspaceId,
        input: {
            'text': req.query.text
        },
        context: context
    }, function(err, response) {
        if (err) {
            console.log('error:', err);
            payload = {
                text: "?"
            };
        } else {
            payload = response;
        }
        res.send(JSON.stringify(payload, null, 2));
    });


});

module.exports = router;
