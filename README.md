# Payload reCAPTCHA v3 Plugin

[![NPM](https://img.shields.io/npm/v/payload-recaptcha-v3)](https://www.npmjs.com/package/payload-recaptcha-v3)
[![CI](https://github.com/GeorgeHulpoi/payload-recaptcha-v3/workflows/Test/badge.svg?branch=main)](https://github.com/GeorgeHulpoi/payload-recaptcha-v3/actions?query=workflow%3ATest)
[![Downloads](http://img.shields.io/npm/dm/payload-recaptcha-v3.svg)](https://www.npmjs.com/package/payload-recaptcha-v3)

A plugin for [Payload](https://github.com/payloadcms/payload) to protect collection's operations using Google reCAPTCHA v3.

## Installation

```shell
yarn add payload-recaptcha-v3
# OR
npm i payload-recaptcha-v3
```

## Configuration

In the `plugins` array of your [Payload config](https://payloadcms.com/docs/configuration/overview), call the plugin with [options](#plugin-options):

```ts
import { buildConfig } from 'payload/config';
import reCAPTCHAv3 from 'payload-recaptcha-v3';

const config = buildConfig({
	// ... rest of your config
	plugins: [
		reCAPTCHAv3({
			secret: process.env.GOOGLE_RECAPTCHA_SECRET,
		}),
	],
});

export default config;
```

### Plugin Options

-   `secret`: string

    Required. Your Google reCAPTCHA v3 secret key.

-   `errorHandler`: [reCAPTCHAErrorHandler](#recaptchaerrorhandler)

    Optional. The function that throws the exception. By default, it throws Forbidden when the response from Google is not a success.

## Usage

To protect a collection's operation, you have to add in the [Collection Config](https://payloadcms.com/docs/configuration/collections) the property `recaptcha` into the `custom`.
The `recaptcha` property has to be an array of strings containing the operation name according to [Available Collection operations](https://payloadcms.com/docs/hooks/collections#beforeoperation).

```ts
import { CollectionConfig } from 'payload/types';

export const Orders: CollectionConfig = {
	slug: 'orders',
	fields: [],
	// ... rest of your config
	custom: {
		recaptcha: [
			{
				name: 'create',
				action: 'submit',
			},
			{
				name: 'update',
				action: 'modify',
			},
		],
	},
};

export default Orders;
```

Then, when you make an HTTP Request to the Payload API, include the header `X-reCAPTCHA-V3` with the token received from Google:

```js
   <script>
      function onClick(e) {
        e.preventDefault();
        grecaptcha.ready(function() {
          grecaptcha.execute('reCAPTCHA_site_key', {action: 'submit'}).then(function(token) {
            fetch('/api/orders', {
              method: 'POST',
              headers: {
                'X-reCAPTCHA-V3': token
              },
              body: JSON.stringify({...})
            })
          });
        });
      }
  </script>
```

## Tests

Tests are using Jest, to run the tests use:

```shell
npm test
```

## Types

### reCAPTCHAErrorHandler

A function that has the purpose of throwing an exception depending on the response received from Google.

```ts
type reCAPTCHAErrorHandler = (response?: reCAPTCHAResponse) => void;
```

### reCAPTCHAResponse

The response received from Google when verifying the token.

**Properties**

| Name                                 | Description                                                          |
| :----------------------------------- | :------------------------------------------------------------------- |
| success: boolean                     | whether this request was a valid reCAPTCHA token for your site       |
| score: number                        | the score for this request (0.0 - 1.0)                               |
| action: string                       | the action name for this request (important to verify)               |
| challenge_ts: number                 | timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ) |
| hostname: string                     | the hostname of the site where the reCAPTCHA was solved              |
| 'error-codes'?: reCAPTCHAErrorCode[] | optional                                                             |

### reCAPTCHAErrorCode

| Error code             | Description                                                                     |
| :--------------------- | :------------------------------------------------------------------------------ |
| missing-input-secret   | The secret parameter is missing.                                                |
| invalid-input-secret   | The secret parameter is invalid or malformed.                                   |
| missing-input-response | The response parameter is missing.                                              |
| invalid-input-response | The response parameter is invalid or malformed.                                 |
| bad-request            | The request is invalid or malformed.                                            |
| timeout-or-duplicate   | The response is no longer valid: either is too old or has been used previously. |
| invalid-keys           | Unknown                                                                         |
