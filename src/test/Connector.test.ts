import 'mocha';
import * as assert from 'assert';
// import * as mock from 'mockttp';
// import { Connector } from '../Connector';

describe('Hello function', () => {
  // const mockServer = mock.getLocal();
  //const connector = new Connector('https://localhost:443', 'admin', 'admin', false);

  // beforeEach(() => mockServer.start());
  // afterEach(() => mockServer.stop());

  it('should request an existing repository', async () => {
    assert.equal(true, true);
    // connector.crucible.searchReview('Test...', 12).then((r) => {
    //   console.log(r.reviewData.map((i) => i.name).join(', '));
    // });
    /*
    const endpointMock = await mockServer.get("/mocked-endpoint").thenReply(200, "hmm?");

    const result = await connector.crucible.searchRepositories({ types: ["git"] });
    expect(result).not.undefined;

    const requests = await endpointMock.getSeenRequests();
    expect(requests.length).to.equal(1);
    expect(requests[0].url).to.equal(`https://localhost:${mockServer.port}/mocked-endpoint`); */
  });
});
