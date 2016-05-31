import hex from './hex.js';
import Dexie from './dexie.js';

let Message = {};

Message.Store = class {
  constructor(clientUid) {
    this.db = new Dexie(clientUid);
    this.db.version(1).stores({
      messages: `++id, ${Message.Model.attrs()}`
    });
  }

  all(fn) {
    return this.db.messages.toArray(fn);
  }

  save(message, fn) {
    this.db.transaction('rw', this.db.messages, () => {
      this.db.messages.add(message.serialized);
    }).then(fn).catch(e => console.log(e));
  }
}

Message.Model = class {
  static attrs() {
    return 'clientUid, text, uid';
  }

  static parse(attrs) {
    let msg = new Message.Model(attrs.clientUid, attrs.text, attrs.uid);
    return msg;
  }

  constructor(clientUid, text, uid = hex()) {
    this.clientUid = clientUid;
    this.text = text;
    this.uid = uid;
  }

  get serialized() {
    return { clientUid: this.clientUid, text: this.text, uid: this.uid };
  }

  get fingerprint() {
    return [this.clientUid, this.uid];
  }

  equal(record) {
    return this.fingerprint.every((a, i) => a === record.fingerprint[i]);
  }
};

Message.Set = class {
  constructor(messages = []) {
    this.messages = messages;
  }

  get length() {
    return this.messages.length;
  }

  add(message) {
    let existing = this.messages.find(a => a.equal(message));
    if (!existing) this.messages.push(message);
    return message;
  }

  merge(set) {
    let merged = new Message.Set(this.messages.slice());
    set.messages.forEach(a => merged.add(a));
    return merged;
  }

  ordered() {
    // return array of messages
  }
}

export default Message;
