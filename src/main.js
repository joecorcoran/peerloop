import ChatLog from 'chat-log.js';
import ChatClient from 'chat-client.js';
import Store from 'store.js';

const log = new ChatLog('chat'),
      client = new ChatClient(log),
      store = new Store('peerloop');

export const run = function() {
  const inviteBtn = document.getElementById('invite'),
        acceptBtn = document.getElementById('accept'),
        confirmBtn = document.getElementById('confirm'),
        messageForm = document.getElementById('message');

  inviteBtn.addEventListener('click', function() {
    log.printLine('Creating channel and generating invitation code...');
    client.createChannel();
    client.offer();
    document.dispatchEvent(new Event('peerloop:ui:invited'));
  }, false);

  acceptBtn.addEventListener('click', function() {
    const offer = prompt('Did someone send you an invitation code? Paste it here...');
    client.answer(offer);
    document.dispatchEvent(new Event('peerloop:ui:accepted'));
  }, false);

  confirmBtn.addEventListener('click', function() {
    const answer = prompt('Did you receive a confirmation code back? Paste it here...');
    log.printLine('Waiting for connection...');
    client.connect(answer);
    document.dispatchEvent(new Event('peerloop:ui:confirmed'));
  }, false);

  messageForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const txt = document.getElementById('message-text');
    client.sendMessage(txt.value);
    txt.value = '';
  }, false);

  document.addEventListener('peerloop:offer', function(event) {
    const offer = event.detail;
    log.printLine('Done! Send this code to a friend:');
    log.printLine(btoa(JSON.stringify(offer)));
  }, false);

  document.addEventListener('peerloop:answer', function(event) {
    const answer = event.detail;
    log.printLine('Thanks! Send this confirmation code back to the person who invited you:');
    log.printLine(btoa(JSON.stringify(answer)));
  }, false);

  document.addEventListener('peerloop:channel:open', function() {
    log.printLine('Peer-to-peer connection established. Time to chat!');
    const elements = document.getElementsByClassName('chatready');
    Array.prototype.forEach.call(elements, function(element) {
      element.disabled = false;
    });
    document.getElementById('message-text').focus();
  }, false);

  document.addEventListener('peerloop:ui:invited', function() {
    inviteBtn.disabled = true;
    acceptBtn.disabled = true;
    confirmBtn.disabled = false;
  }, false);

  document.addEventListener('peerloop:ui:accepted', function() {
    inviteBtn.disabled = true;
    acceptBtn.disabled = true;
    confirmBtn.disabled = true;
  }, false);

  document.addEventListener('peerloop:ui:confirmed', function() {
    inviteBtn.disabled = true;
    acceptBtn.disabled = true;
    confirmBtn.disabled = true;
  }, false);

  document.addEventListener('peerloop:message', function(event) {
    log.printMessage(event.detail);
    store.saveMessage(event.detail.message);
    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
  }, false);

  log.printLine('Welcome!');
  log.printLine('This is experimental, peer-to-peer chat software.');
  log.printLine('Do you want to invite someone to chat, or accept an invitation?');
};
