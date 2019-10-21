# Crucible Connector

A typed JavaScript REST client for [Atlassian's Crucible](https://www.atlassian.com/de/software/crucible).

NOTICE: This package is currently under heavy development and not yet much tested (coming soon).

## Installation

```
npm install --save crucible-connector
```

## Features

- Create a REST client to communicate with your Crucible/Fisheye server.
- Call all available methods of the [Crucible API](https://docs.atlassian.com/fisheye-crucible/latest/wadl/crucible.html).
- _Coming soon:_ Call all available methods of the [Crucible/Fisheye Common API](https://docs.atlassian.com/fisheye-crucible/latest/wadl/fecru.html).
- _Coming soon:_ Call all available methods of the [Fisheye API](https://docs.atlassian.com/fisheye-crucible/latest/wadl/fisheye.html).

More details about the API can be found at the [Crucible REST API Guide](https://developer.atlassian.com/server/fisheye-crucible/rest-api-guide/).

### Usage

Create your REST client.

```js
/**
 * Create a new connector
 * @param host           Host where crucible/fisheye runs (e.g.: https://crucible.example.com:443)
 * @param username       Username to authenticate
 * @param password       Password to authenticate
 * @param useAccessToken If set to true, only the first request is sent with basic auth and all
 *                       subsequent requests will use an access token.
 *                       (default: true)
 * @param ignoreSslError Set to true if https connections should not be validated.
 *                       This options is useful when using self signed certificates.
 *                       (default: false)
 */
const connector = new Connector('https://crucible.example.com:443', 'user', 'password');
```

Now start to communicate via `common`, `crucible` and `fisheye`:

```js
connector.crucible
  .searchRepositories({ types: ['git'] })
  .then((result) => {
    console.log(result.repoData.map((repo) => repo.name).join(', '));
  })
  .catch((error) => {
    console.log(error);
  });
```

## What's next?

- Better authenticating
- Implement the remaining parts of [Fisheye API](https://docs.atlassian.com/fisheye-crucible/4.5.1/wadl/fecru.html) and [Crucible/Fisheye Common API](https://docs.atlassian.com/fisheye-crucible/latest/wadl/fecru.html).

## Acknowledgements

This package uses [Microsoft Typed REST Client](https://github.com/Microsoft/typed-rest-client) as underlying REST Client.

## Contributors

[Matthias Füg](https://github.com/mfueg)

Feel free to contribute...

## License

[MIT](https://github.com/mfueg/crucible-connector/blob/master/LICENSE)
