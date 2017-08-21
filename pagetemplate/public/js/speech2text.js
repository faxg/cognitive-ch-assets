var S2T_initialized = false;
var S2T_ready = false;



function initSpeech2Text(){
  fetch('/speech2text/token') // Fetch authorization token
    .then(function(response) {
      ko.ViewModel.s2t_token (response.text());
    });
};

function openMic(){

}
function closeMic(){

}
