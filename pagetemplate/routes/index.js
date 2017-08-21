var express = require('express');
var _ = require('lodash');


//var watson = require('watson-developer-cloud');
const watson = require('watson-developer-cloud');

var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');


var fs = require('fs');


var conversation = new ConversationV1({
    username: process.env.WDC_USERNAME,
    password: process.env.WDC_PASSWORD,
    version_date: ConversationV1.VERSION_DATE_2016_09_20
});
var text_to_speech = new TextToSpeechV1({
  username: process.env.T2S_USERNAME,
  password: process.env.T2S_PASSWORD
});
// var speech_to_text = new SpeechToTextV1({
//   username: process.env.S2T_USERNAME,
//   password: process.env.S2T_PASSWORD
// });
// var speech_to_text_params = {
//   model: 'en-US_BroadbandModel',
//   content_type: 'audio/flac',
//   'interim_results': true,
//   'max_alternatives': 3,
//   'word_confidence': false,
//   timestamps: false,
//   keywords: ['UBS', 'banking'],
//   'keywords_threshold': 0.5
// };
const t2s_credentials = {
  username: process.env.S2T_USERNAME,
  password: process.env.S2T_PASSWORD,
  url: 'https://stream.watsonplatform.net/speech-to-text/api',
  version: 'v1'
};

const authorizationService = watson.authorization(t2s_credentials);


// // Create the stream.
// var recognizeStream = speech_to_text.createRecognizeStream(speech_to_text_params);
// // Get strings instead of buffers from 'data' events.
// recognizeStream.setEncoding('utf8');
// // Listen for events.
// recognizeStream.on('results', function(event) { onEvent('Results:', event); });
// recognizeStream.on('data', function(event) { onEvent('Data:', event); });
// recognizeStream.on('error', function(event) { onEvent('Error:', event); });
// recognizeStream.on('close', function(event) { onEvent('Close:', event); });
// recognizeStream.on('speaker_labels', function(event) { onEvent('Speaker_Labels:', event); });
//
// // Displays events on the console.
// function onEvent(name, event) {
//   console.log(name, JSON.stringify(event, null, 2));
// };



var router = express.Router();
// Authentication module.
var auth = require('http-auth');
var basic = auth.basic({
    realm: "Protected",
    file: __dirname + "/../users.htpasswd"
});



var workspaceId = process.env.WDC_WORKSPACE_ID;


/* GET home page. protected*/
router.get('/', auth.connect(basic), function(req, res, next) {
    var templateValues = {
      WDC_WORKSPACE_ID: workspaceId
    };
    res.render('index', templateValues);
});

/* */
router.get ('/speech2text/token', function (req, res, next){
  console.log (t2s_credentials);
  authorizationService.getToken({ url: t2s_credentials.url }, function (error, token)  {
      if (error) {
        res.send(error);
      } else {
        res.send(token);
      }
    });
});



router.get ('/text2speech', function (req, res){

  var params = {
    text: req.query.text || '',
    voice: req.query.voice || 'en-US_AllisonVoice',//'de-DE_BirgitVoice'
    accept: 'audio/wav'
  };

  res.set({
    'Content-Type': 'audio/wav',
    'Transfer-Encoding': 'chunked'
  });

  // stream response to synthesized audio
  if (params.text){
    text_to_speech.synthesize(params).pipe(res);
  } else{
    res.end();
  }
});



router.get('/watson-chat', function(req, res) {
    var payload = {};


    // we simply pass the context with the query param
    var context = JSON.parse (req.query.context || {});
    workspaceId = req.query.workspaceId || workspaceId;

    // request object for conversation service
    var conversationRequest = {
        workspace_id: workspaceId,
        input: {
            'text': req.query.text || ''
        },
        context: context
    };

    conversation.message(conversationRequest, function(err, response) {
        if (err) {
            console.log('error:', JSON.stringify(err,null,2));
            payload = {
                output: {
                  text: 'Sorry, but: ' + err.error
                }
            };
        } else {
            payload = response;

            // now create a text to speech stream, save to file and send link to .wav file back to browser

        }
        res.send(JSON.stringify(payload, null, 2));
    });


});

module.exports = router;
