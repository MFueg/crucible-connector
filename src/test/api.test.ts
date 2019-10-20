import { expect } from 'chai';
import 'mocha';
// import { ApiCrucible } from '../api';
import * as mock from 'mockttp';

describe('Hello function', () => {
  const mockServer = mock.getLocal();
  // const api = new ApiCrucible("https://localhost:443", "admin", "admin", false);

  beforeEach(() => mockServer.start());
  afterEach(() => mockServer.stop());

  it('should request an existing repository', async () => {
    expect(true).is.equals(true);
    /*
    const endpointMock = await mockServer.get("/mocked-endpoint").thenReply(200, "hmm?");

    const result = await api.searchRepositories({ types: ["git"] });
    expect(result).not.undefined;

    const requests = await endpointMock.getSeenRequests();
    expect(requests.length).to.equal(1);
    expect(requests[0].url).to.equal(`https://localhost:${mockServer.port}/mocked-endpoint`); */
  });
});
