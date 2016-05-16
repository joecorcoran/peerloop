var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

var ChatLog = function(container) {
  this.container = document.getElementById(container);
};

ChatLog.prototype.printLine = function(text) {
  var textNode = document.createTextNode(text),
      line = document.createElement('p');
  line.appendChild(textNode);
  this.container.appendChild(line);
};

ChatLog.prototype.printMessage = function(data) {
  var uidNode = document.createTextNode(data.uid),
      msgNode = document.createTextNode(' ' + data.message),
      span = document.createElement('span'),
      line = document.createElement('p');
  span.style.color = '#' + data.uid;
  span.appendChild(uidNode);
  line.appendChild(span);
  line.appendChild(msgNode);
  this.container.appendChild(line);
};

var ChatClient = function(log) {
  var config = { iceServers: [{ url: 'stun:stun.stunprotocol.org' }] },
      connection = { optional: [{'DtlsSrtpKeyAgreement': true}] };

  this.log = log;
  this.conn = new RTCPeerConnection(config, connection);
  this.channel = null;
  this.uid = Math.floor(Math.random()*16777215).toString(16);

  this.initConn();
};

ChatClient.prototype.initConn = function() {
  this.conn.onicecandidate = function (e) {
    if (e.candidate == null && this.conn.localDescription.type == 'offer') {
      var offer = JSON.stringify(this.conn.localDescription);
      console.log('Offer', offer);
      this.log.printLine('Send this to someone you know:');
      this.log.printLine(btoa(offer));
    }
  }.bind(this);

  this.conn.ondatachannel = function(e) {
    this.channel = e.channel || e;
    this.setupChannel();
  }.bind(this);

  this.conn.onconnection = console.info.bind(console);
  this.conn.onsignalingstatechange = console.info.bind(console);
  this.conn.oniceconnectionstatechange = console.info.bind(console);
  this.conn.onicegatheringstatechange = console.info.bind(console);
};

ChatClient.prototype.createChannel = function() {
  try {
    this.channel = this.conn.createDataChannel('test', { reliable: true });
    this.setupChannel();
  } catch (e) {
    console.warn('Could not create data channel', e);
  }
};

ChatClient.prototype.setupChannel = function() {
  this.channel.onopen = function (e) {
    console.log('Data channel open');
    document.dispatchEvent(new Event('chatready'));
  }.bind(this);
  this.channel.onmessage = function (e) {
    if (e.data.charCodeAt(0) == 2) { return }
    var data = JSON.parse(e.data);
    console.log(data);
    this.log.printMessage(data);
  }.bind(this);
};

ChatClient.prototype.offer = function() {
  this.conn.createOffer(
    function (offer) {
      this.conn.setLocalDescription(offer, function () {}, function () {});
      console.log('Created local offer', offer);
    }.bind(this),
    function () {
      console.warn('Could not create offer');
    }.bind(this),
    { optional: [], mandatory: {} }
  );
};

ChatClient.prototype.answer = function(offer) {
  var offer = atob(offer);
  this.conn.setRemoteDescription(JSON.parse(offer));
  this.conn.createAnswer(
    function (answer) {
      this.conn.setLocalDescription(answer);

      var answer = JSON.stringify(answer);
      console.log('Created local answer', answer);
      this.log.printLine('Thanks! Send this confirmation code back to the person who invited you:');
      this.log.printLine(btoa(answer));
    }.bind(this),
    function () {
      console.warn('Could not create answer');
    }.bind(this),
    { optional: [], mandatory: {} }
  );
};

ChatClient.prototype.connect = function(answer) {
  var answer = atob(answer);
  this.conn.setRemoteDescription(JSON.parse(answer)); 
};

ChatClient.prototype.sendMessage = function(msg) {
  var data = { uid: this.uid, message: msg };
  this.channel.send(JSON.stringify(data));
  this.log.printMessage(data);
};

// Move this into better structure
var log = new ChatLog('chat');
var client = new ChatClient(log);

document.getElementById('invite').addEventListener('click', function() {
  log.printLine('Creating channel and generating invitation code...');
  client.createChannel();
  client.offer();
});

document.getElementById('accept').addEventListener('click', function() {
  var offer = prompt('Paste invitation code');
  client.answer(offer);
});

document.getElementById('confirm').addEventListener('click', function() {
  var answer = prompt('Paste confirmation code');
  log.printLine('Waiting for connection...');
  client.connect(answer);
});

document.addEventListener('chatready', function() {
  log.printLine('Connection ready. Time to chat!');
  var elements = document.getElementsByClassName('chatready');
  Array.prototype.forEach.call(elements, function(element) {
    element.disabled = false;
  });
});

document.getElementById('message').addEventListener('submit', function(e) {
  e.preventDefault();
  var txt = document.getElementById('message-text');
  client.sendMessage(txt.value);
  txt.value = '';
}, false);
