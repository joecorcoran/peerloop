var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

var ChatLog = function(container) {
  this.container = document.getElementById(container);
};

ChatLog.prototype.print = function(msg) {
  var textNode = document.createTextNode(msg),
      line = document.createElement('p');
  line.appendChild(textNode);
  this.container.appendChild(line);
};

var ChatClient = function(log) {
  var config = { iceServers: [{ url: 'stun:23.21.150.121' }] },
      connection = { optional: [{'DtlsSrtpKeyAgreement': true}] };

  this.log = log;
  this.conn = new RTCPeerConnection(config, connection);
  this.channel = null;

  this.initConn();
};

ChatClient.prototype.initConn = function() {
  this.conn.onicecandidate = function (e) {
    if (e.candidate == null && this.conn.localDescription.type == 'offer') {
      var offer = JSON.stringify(this.conn.localDescription);
      console.log('Offer', offer);
      this.log.print('Send this code to a friend: ' + btoa(offer));
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
    this.log.print('Chat ready!');
    console.log('Data channel open');
  }.bind(this);
  this.channel.onmessage = function (e) {
    if (e.data.charCodeAt(0) == 2) { return }
    var data = JSON.parse(e.data);
    console.log(data);
    this.log.print(data.message);
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
      this.log.print('Send this response to your friend: ' + btoa(answer));
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
  this.channel.send(JSON.stringify({ message: msg }));
};

// Move this into better structure
var log = new ChatLog('chat');
var client = new ChatClient(log);

function offer() {
  client.createChannel();
  client.offer();
};

function answer() {
  var offer = prompt('Paste code');
  client.answer(offer);
};

function connect() {
  var answer = prompt('Paste your friend\'s response');
  client.connect(answer);
};

function sendMessage() {
  var txt = document.getElementById('message'),
      msg = txt.value;
  client.sendMessage(msg);
  log.print(msg);
  txt.value = '';
};
