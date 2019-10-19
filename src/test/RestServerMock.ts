/**
 * https://github.com/httptoolkit/mockttp/blob/HEAD/docs/setup.md
*/

import * as mock from 'mockttp'

export class CrucibleMock {
  private mockServer = mock.getLocal();
  public readonly host: string = "localhost";

  public constructor(public readonly port: number) {
    this.mockServer.get('/mocked-path').thenReply(200, 'A mocked response');
  }

  public start() {
    return this.mockServer.start(this.port);
  }

  public stop() {
    return this.mockServer.stop();
  }
}
