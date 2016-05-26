import Dexie from 'dexie.js';

export default class {
  constructor(name) {
    this.db = new Dexie(name);
    this.db.version(1).stores({
      messages: 'text'
    });
  }

  saveMessage(msg) {
    this.db.transaction('rw', this.db.messages, function() {
      this.db.messages.add({ text: msg });
    }).catch(e => console.log(e));
  }
}
