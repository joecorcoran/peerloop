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

describe('Message.Set', () => {
  describe('add', () => {
    it('adds message if not already present', () => {
      let one = new Message.Model('a', 'hello', 'b'),
          set = new Message.Set();
      expect(set.length).toEqual(0);
      set.add(one);
      expect(set.length).toEqual(1);
    });

    it('does not add duplicates', () => {
      let one = new Message.Model('a', 'hello', 'b'),
          two = new Message.Model('a', 'goodbye', 'b'),
          set = new Message.Set([one]);
      expect(set.length).toEqual(1);
      set.add(two);
      expect(set.length).toEqual(1);
    });
  });

  describe('union', () => {
    it('returns a new set containing members of both sets', () => {
      let one = new Message.Set([new Message.Model('a', 'hello', 'b')]),
          two = new Message.Set([new Message.Model('x', 'hello', 'b')]),
          merged = one.union(two);
      expect(one === merged).toBe(false);
      expect(merged instanceof Message.Set).toBe(true);
      expect(merged.length).toEqual(2);
    });
  });

  describe('intersection', () => {
    it('returns a new set containing only members present in both sets', () => {
      let one = new Message.Set([(new Message.Model('a', 'hello', 'b')), (new Message.Model('a', 'yo', 'c'))]),
          two = new Message.Set([(new Message.Model('b', 'bye', 'b')), (new Message.Model('a', 'goodbye', 'b'))]),
          intersection = one.intersection(two);
      expect(one === intersection).toBe(false);
      expect(intersection instanceof Message.Set).toBe(true);
      expect(intersection.length).toEqual(1);
    });
  });
});
