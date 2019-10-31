# Crucible Connector

A typed JavaScript REST client for [Atlassian's Crucible](https://www.atlassian.com/de/software/crucible).

NOTICE: This package is currently under heavy development and not yet much tested (coming soon).

## Features

- Create a REST client to communicate with your Crucible/Fisheye server.
- Call methods of the [Crucible API](https://docs.atlassian.com/fisheye-crucible/latest/wadl/crucible.html).
- Call methods of the [Crucible/Fisheye Common API](https://docs.atlassian.com/fisheye-crucible/latest/wadl/fecru.html).
- Call methods of the [Fisheye API](https://docs.atlassian.com/fisheye-crucible/latest/wadl/fisheye.html).

More details about the API can be found at the [Crucible REST API Guide](https://developer.atlassian.com/server/fisheye-crucible/rest-api-guide/).

## Requirements

This implementation uses the REST API version 4.7.

## Installation

```
npm install --save crucible-connector
```

## Usage

Create your REST client.

```js
const connector = new Connector(
  { host: 'https://crucible.example.com:443', ignoreSslError: false },
  { username: 'user', password: 'password' }
);
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

## Acknowledgements

This package uses [Microsoft Typed REST Client](https://github.com/Microsoft/typed-rest-client) as underlying REST Client.

## Contributors

[Matthias Füg](https://github.com/mfueg)

Feel free to contribute...

## License

[MIT](https://github.com/mfueg/crucible-connector/blob/master/LICENSE)
