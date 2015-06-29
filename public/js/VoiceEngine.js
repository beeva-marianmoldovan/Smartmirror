VoiceAction = function(text, event){
    this.text = text;
    this.event = event;
};

VoiceEngine = function(){
    this.voiceActions = [];
    this.recognizer;

    this.addAction = function(voiceAction){
        this.voiceActions.push(voiceAction);
    };

    this.browserCompatible = function(){
        var speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
        if(speechRecognition)
            return true;
        else return false;
    };

    this.checkActions = function(message, isFinal){
        var minimDistance = 100000;
        var bestAction;
        for(var i = 0; i < this.voiceActions.length;i++){
            var action = this.voiceActions[i];
            var distance = levenshteinDistance(action.text, message);
            if(distance < minimDistance && distance < 5){
                minimDistance = distance;
                bestAction = action;
            }
        }
        if(bestAction && isFinal) {
            bestAction.event();
        }
    };

    this.start = function(){
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
          if(this.browserCompatible()){
              this.recognizer = new window.SpeechRecognition();
              this.recognizer.continuous = true;
              this.recognizer.lang = "es-ES";
              this.recognizer.interimResults = true;

              // Start recognising
              var self = this;
              this.recognizer.onresult = function (event) {
                  for (var i = event.resultIndex; i < event.results.length; i++) {
                      if (event.results[i].isFinal) {
                          self.checkActions(event.results[i][0].transcript, true);
                          console.error(event.results[i][0].transcript + ' (Confidence: ' + event.results[i][0].confidence + ')');
                          if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
                              self.recognizer.start();
                      } else {
                          console.log("Interim ", event.results[i][0].transcript);
                          self.checkActions(event.results[i][0].transcript, false);
                      }
                  }
              };

              // Listen for errors
              this.recognizer.onerror = function (event) {
                  console.error('Recognition error: ' + event.message);
                  self.start();
              };

              console.log(this.recognizer);
              try {
                  this.recognizer.start();
              } catch (ex) {
                  console.error(ex);
              }
          }
    };

    this.stop = function(){
        this.recognizer.stop();
    };
};


function levenshteinDistance (s, t){
    var d = []; //2d matrix

    // Step 1
    var n = s.length;
    var m = t.length;

    if (n === 0) {
        return m;
    }
    if (m === 0) {
        return n;
    }

    var i = n;
    //Create an array of arrays in javascript (a descending loop is quicker)
    for (; i >= 0; i--) {
        d[i] = [];
    }

    // Step 2
    for (i = n; i >= 0; i--) {
        d[i][0] = i;
    }
    var j = m;
    for (; j >= 0; j--) {
        d[0][j] = j;
    }

    // Step 3
    for (i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);

        // Step 4
        for (j = 1; j <= m; j++) {

            //Check the jagged ld total so far
            if (i === j && d[i][j] > 4) {
                return n;
            }

            var t_j = t.charAt(j - 1);
            var cost = (s_i === t_j) ? 0 : 1; // Step 5

            //Calculate the minimum
            var mi = d[i - 1][j] + 1;
            var b = d[i][j - 1] + 1;
            var c = d[i - 1][j - 1] + cost;

            if (b < mi) {
                mi = b;
            }
            if (c < mi) {
                mi = c;
            }

            d[i][j] = mi; // Step 6

            //Damerau transposition
            if (i > 1 && j > 1 && s_i === t.charAt(j - 2) && s.charAt(i - 2) === t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }

    // Step 7
    return d[n][m];
};
