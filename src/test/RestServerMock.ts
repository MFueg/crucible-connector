// https://github.com/httptoolkit/mockttp/blob/HEAD/docs/setup.md

export function initCrucibleServer(mockServer: any) {
  return mockServer.get('/mocked-path').thenReply(200, 'A mocked response');
}
