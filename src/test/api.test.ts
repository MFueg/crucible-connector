import { expect } from 'chai';
const mockServer = require('mockttp').getLocal();
import 'mocha';
// import { ApiCrucible } from '../api';

describe('Hello function', () => {
  // Start your server
  beforeEach(() => mockServer.start(8080));
  afterEach(() => mockServer.stop());

  it('should return hello world', () => {
    // let api = new ApiCrucible("localhost", "test", "test", false);
    expect('Hello World!').to.equal('Hello World!');
  });
});
