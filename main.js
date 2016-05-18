(function(window, document) {
  'use strict';

  var moz = function() {
    return window.hasOwnProperty('mozPaintCount');
  };

  var sessionConstraints = moz() ? { offerToReceiveAudio: false, offerToReceiveVideo: false } : {};

  var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

  var ChatClient = function(log) {
    var config = { iceServers: [{ url: 'stun:stun.services.mozilla.com' }] },
        connection = { optional: [{'DtlsSrtpKeyAgreement': true}] };

    this.log = log;
    this.conn = new RTCPeerConnection(config, connection);
    this.channel = null;
    this.uid = Math.floor(Math.random()*16777215).toString(16);

    this.initConn();
  };

  ChatClient.prototype.initConn = function() {
    this.conn.onicecandidate = function (event) {
      var desc = this.conn.localDescription;
      if (event.candidate == null && desc.type == 'offer') {
        console.log('Offer', desc);
        document.dispatchEvent(new CustomEvent('chatoffer', { detail: desc }));
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
    this.channel.onmessage = function (event) {
      if (event.data.charCodeAt(0) == 2) { return }
      var data = JSON.parse(event.data);
      console.log(data);
      document.dispatchEvent(new CustomEvent('chatmessage', { detail: data }));
    }.bind(this);
  };

  ChatClient.prototype.offer = function() {
    this.conn.createOffer(
      function (offer) {
        this.conn.setLocalDescription(offer, function() {}, function() {});
        console.log('Created local offer', offer);
      }.bind(this),
      function () {
        console.warn('Could not create offer');
      }.bind(this),
      sessionConstraints 
    );
  };

  ChatClient.prototype.answer = function(offer) {
    var offer = atob(offer);
    offer = moz() ? new RTCSessionDescription(JSON.parse(offer)) : JSON.parse(offer);
    this.conn.setRemoteDescription(offer);
    this.conn.createAnswer(
      function (answer) {
        this.conn.setLocalDescription(answer);
        console.log('Created local answer', answer);
        document.dispatchEvent(new CustomEvent('chatanswer', { detail: answer }));
      }.bind(this),
      function () {
        console.warn('Could not create answer');
      }.bind(this),
      sessionConstraints 
    );
  };

  ChatClient.prototype.connect = function(answer) {
    var answer = atob(answer);
    answer = moz() ? new RTCSessionDescription(JSON.parse(answer)) : JSON.parse(answer);
    this.conn.setRemoteDescription(answer); 
  };

  ChatClient.prototype.sendMessage = function(msg) {
    var data = { uid: this.uid, message: msg };
    this.channel.send(JSON.stringify(data));
    document.dispatchEvent(new CustomEvent('chatmessage', { detail: data }));
  };

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

  var log = new ChatLog('chat'),
      client = new ChatClient(log);

  var inviteBtn = document.getElementById('invite'),
      acceptBtn = document.getElementById('accept'),
      confirmBtn = document.getElementById('confirm'),
      messageForm = document.getElementById('message');

  inviteBtn.addEventListener('click', function() {
    log.printLine('Creating channel and generating invitation code...');
    client.createChannel();
    client.offer();
    document.dispatchEvent(new Event('chatinvited'));
  }, false);

  acceptBtn.addEventListener('click', function() {
    var offer = prompt('Did someone send you an invitation code? Paste it here...');
    client.answer(offer);
    document.dispatchEvent(new Event('chataccepted'));
  }, false);

  confirmBtn.addEventListener('click', function() {
    var answer = prompt('Did you receive a confirmation code back? Paste it here...');
    log.printLine('Waiting for connection...');
    client.connect(answer);
    document.dispatchEvent(new Event('chatconfirmed'));
  }, false);

  messageForm.addEventListener('submit', function(event) {
    event.preventDefault();
    var txt = document.getElementById('message-text');
    client.sendMessage(txt.value);
    txt.value = '';
  }, false);

  document.addEventListener('chatoffer', function(event) {
    var offer = event.detail;
    log.printLine('Done! Send this code to a friend:');
    log.printLine(btoa(JSON.stringify(offer)));
  }, false);

  document.addEventListener('chatanswer', function(event) {
    var answer = event.detail;
    log.printLine('Thanks! Send this confirmation code back to the person who invited you:');
    log.printLine(btoa(JSON.stringify(answer)));
  }, false);

  document.addEventListener('chatready', function() {
    log.printLine('Peer-to-peer connection established. Time to chat!');
    var elements = document.getElementsByClassName('chatready');
    Array.prototype.forEach.call(elements, function(element) {
      element.disabled = false;
    });
    document.getElementById('message-text').focus();
  }, false);

  document.addEventListener('chatinvited', function() {
    inviteBtn.disabled = true;
    acceptBtn.disabled = true;
    confirmBtn.disabled = false;
  }, false);
  
  document.addEventListener('chataccepted', function() {
    inviteBtn.disabled = true;
    acceptBtn.disabled = true;
    confirmBtn.disabled = true;
  }, false);

  document.addEventListener('chatconfirmed', function() {
    inviteBtn.disabled = true;
    acceptBtn.disabled = true;
    confirmBtn.disabled = true;
  }, false);

  document.addEventListener('chatmessage', function(event) {
    log.printMessage(event.detail);
    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
  }, false);

  log.printLine('Welcome!');
  log.printLine('This is experimental, peer-to-peer chat software.');
  log.printLine('Do you want to invite someone to chat, or accept an invitation?');

})(window, document);
