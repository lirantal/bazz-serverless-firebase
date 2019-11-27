# bazz-frontend

The frontend interface for npm's [bazz](https://github.com/lirantal/bazz) CLI tool.

Note: the project was scafollded using facebook's [create-react-app](https://github.com/facebookincubator/create-react-app) without ejecting, so for any project related scripts and maintenance refer to their README.

Note: CRA comes bundled with a generic service worker support that caches files but it's not possible to create custom service worker events, such as one that will listen for push notifications. To support this without ejecting the project, a dependency is introduced called `cra-append-sw` which allows creating a `custom-sw.js` file to register as a service worker that will bundle with the rest of the project once built.

# CI

Travis-CI integration is used to test and build the static assets.

When Pull-Requests are merged to the `master` branch, travis will deploy them to an S3 bucket from which they will be served later on by CloudFront.

For the AWS deployment part, the following environment variables need to be available on the CI:

- AWS_ACCESS_KEY_ID
- AWS_CLOUDFRONT_DISTRIBUTION_ID
- AWS_DEFAULT_REGION
- AWS_SECRET_ACCESS_KEY

# Running Locally

## A local configuration file

CRA takes `.env` and replaces any environment variables used in the code with the environment variables declared in the `.env` file.

To work with a local API server you can create a `.env.local` file without commiting it to git and push any environment variables there (they will override what has been declared in `.env`)

## Build and serve the frontend

Serve it with hot-reload:

```bash
$ npm run start
```

### Serving the production build

Install http-server and use it to serve the files and proxy API requests to an API endpoint, i.e:

```bash
$ yarn build && http-server build --proxy http://localhost:3000 -p 3001
```

# Web Push Support

To support web push notifications, the server needs to create a public/private key-pair, where the public key is kept on the frontend and the private key on the backend.
The keys are used on the frontend to create a push notification subscription, and later on the server to trigger a notification for a given subscription.

On the frontend project, the public key is at `src/helpers/pushApi.js` in `applicationServerKey` object key.

## Generating keys

When needed, new keys can be generated and used:

```bash
$ yarn global add web-push
$ web-push generate-vapid-keys --json
```

# Related

[bazz-serverless](https://github.com/lirantal/bazz-serverless) - the aws lambda serverless project

[bazz](https://github.com/lirantal/bazz) - the Node.js CLI app

# Author

Liran Tal <liran.tal@gmail.com>
