const RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

const moz = function() {
  return window.hasOwnProperty('mozPaintCount');
};

const sessionConstraints = moz() ? { offerToReceiveAudio: false, offerToReceiveVideo: false } : {};

export default class {
  constructor(log) {
    const config = { iceServers: [{ url: 'stun:stun.services.mozilla.com' }] },
          connection = { optional: [{'DtlsSrtpKeyAgreement': true}] };

    this.log = log;
    this.conn = new RTCPeerConnection(config, connection);
    this.channel = null;
    this.uid = Math.floor(Math.random()*16777215).toString(16);

    this.initConn();
  }

  initConn() {
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
  }

  createChannel() {
    try {
      this.channel = this.conn.createDataChannel('test', { reliable: true });
      this.setupChannel();
    } catch (e) {
      console.warn('Could not create data channel', e);
    }
  }

  setupChannel() {
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
  }

  offer() {
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
  }

  answer(offer) {
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
  }

  connect(answer) {
    var answer = atob(answer);
    answer = moz() ? new RTCSessionDescription(JSON.parse(answer)) : JSON.parse(answer);
    this.conn.setRemoteDescription(answer); 
  }

  sendMessage(msg) {
    const data = { uid: this.uid, message: msg };
    this.channel.send(JSON.stringify(data));
    document.dispatchEvent(new CustomEvent('chatmessage', { detail: data }));
  }
}
