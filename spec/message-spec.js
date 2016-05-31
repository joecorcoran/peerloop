import Message from '../message.js';

describe('Message.Model', () => {
  describe('static attrs', () => {
    it('returns string specifying attrs for db setup', () => {
      expect(Message.Model.attrs()).toEqual('clientUid, text, uid');
    });
  });

  describe('static parse', () => {
    it('creates a new model based on object containing attrs', () => {
      let msg = Message.Model.parse({ clientUid: 'a', text: 'hello', uid: 'b' });
      expect(msg instanceof Message.Model).toBe(true);
      expect(msg.clientUid).toEqual('a');
      expect(msg.text).toEqual('hello');
      expect(msg.uid).toEqual('b');
    });
  });

  describe('serialized', () => {
    it('returns object containing model attrs', () => {
      let msg = new Message.Model('a', 'hello', 'b');
      expect(msg.serialized).toEqual({ clientUid: 'a', text: 'hello', uid: 'b' });
    });
  });

  describe('fingerprint', () => {
    it('returns two-member array containing client uid and uid', () => {
      let msg = new Message.Model('a', 'hello', 'b');
      expect(msg.fingerprint).toEqual(['a', 'b']);
    });
  });

  describe('equal', () => {
    it('returns true when fingerprints match', () => {
      let one = new Message.Model('a', 'hello', 'b'),
          two = new Message.Model('a', 'goodbye', 'b');
      expect(one.equal(two)).toBe(true);
    });

    it('returns false otherwise', () => {
      let one = new Message.Model('a', 'hello', 'b'),
          two = new Message.Model('x', 'goodbye', 'b');
      expect(one.equal(two)).toBe(false);
    });
  });
});
