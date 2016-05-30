import Message from '../message.js';

describe('Message', () => {
  it('was imported', () => {
    expect(typeof Message.Model.prototype.equal).toEqual('function');
  });
});
