# Payload reCAPTCHA v3 Plugin

[![NPM](https://img.shields.io/npm/v/payload-recaptcha-v3)](https://www.npmjs.com/package/payload-recaptcha-v3)
[![CI](https://github.com/GeorgeHulpoi/payload-recaptcha-v3/workflows/Test/badge.svg?branch=main)](https://github.com/GeorgeHulpoi/payload-recaptcha-v3/actions?query=workflow%3ATest)
[![Downloads](http://img.shields.io/npm/dm/payload-recaptcha-v3.svg)](https://www.npmjs.com/package/payload-recaptcha-v3)

Payload reCAPTCHA v3 is a plugin for [Payload](https://github.com/payloadcms/payload) used to protect collection operations with Google reCAPTCHA v3.

## Installation

Please install the plugin version according to the Payload version. **The major version of the plugin must match the major version of the Payload**.

```shell
yarn add payload-recaptcha-v3
```

```shell
npm i payload-recaptcha-v3
```

```shell
pnpm add payload-recaptcha-v3
```

## Configuration

In the `plugins` property of [Payload config](https://payloadcms.com/docs/configuration/overview), call the plugin with the following [options](#plugin-options):

```ts
import { buildConfig } from 'payload';
import reCAPTCHAv3 from 'payload-recaptcha-v3';

export default buildConfig({
	// ... rest of your config
	plugins: [
		reCAPTCHAv3({
			secret: process.env.GOOGLE_RECAPTCHA_SECRET!,
		}),
	],
});
```

### Plugin Options

-   `secret`: string
    Required. Your Google reCAPTCHA v3 secret key.
-   `errorHandler`: [reCAPTCHAErrorHandler](#recaptchaerrorhandler)
    Optional. [See more details](#recaptchaerrorhandler)
-   `skip`: [reCAPTCHASkip](#recaptchaskip)
    Optional. [See more details](#recaptchaskip)
-   `scoreThreshold`: number
	Optional. A value between 0 and 1 (default is 0.7). The received score from Google reCAPTCHA must be greater or equal than threshold.

## Usage

To protect a collection's operation, you have to add in the [Collection Config](https://payloadcms.com/docs/configuration/collections) the property `recaptcha` into the `custom`.
The `recaptcha` property has to be an array of strings containing the operation name according to [Available Collection operations](https://payloadcms.com/docs/hooks/collections#beforeoperation).

```ts
import type { CollectionConfig } from 'payload';

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

Then, when you make an HTTP Request to the Payload API, include the header `x-recaptcha-v3` with the token received from Google:

```js
   <script>
      function onClick(e) {
        e.preventDefault();
        grecaptcha.ready(function() {
          grecaptcha.execute('reCAPTCHA_site_key', {action: 'submit'}).then(function(token) {
            fetch('/api/orders', {
              method: 'POST',
              headers: {
                'x-recaptcha-v3': token
              },
              body: JSON.stringify({...})
            })
          });
        });
      }
  </script>
```

Optionally, you can set a `errorHandler` or `skip` as described in [Plugin Options](#plugin-options) in a specific operation.

```ts
import type { CollectionConfig } from 'payload';

export const Orders: CollectionConfig = {
	slug: 'orders',
	fields: [],
	// ... rest of your config
	custom: {
		recaptcha: [
			{
				name: 'create',
				action: 'submit',
				errorHandler: (args) => {
					// ...
				},
			},
			{
				name: 'update',
				action: 'modify',
				skip: (args) => {
					// ....
				},
			},
			{
				name: 'delete',
				action: 'delete',
				scoreThreshold: 0.9,
			}
		],
	},
};

export default Orders;
```

## Tests

This plugin uses Playwright for end-to-end testing with Google reCAPTCHA directly. However, there are some steps to test the plugin.

1. Provide `DATABASE_URI`, `RECAPTCHA_SECRET` and `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` environment variables.
2. Run `pnpm build` and then `pnpm dev:build`.
3. Run `pnpm test`.

## Types

### reCAPTCHASkip

A callback function that when returns true, it will skip the Google reCAPTCHA verification (for example, when the user is an admin).

The arguments of function are the same of [Before Operation Hook](https://payloadcms.com/docs/hooks/collections#beforeoperation).

```ts
export type reCAPTCHASkip = (
	args: Parameters<CollectionBeforeOperationHook>[0],
) => boolean;
```

### reCAPTCHAErrorHandler

A callback function that is called when:

-   The header x-recaptcha-v3 is not set.
-   The fetch request generated an error.
-   The response from Google was not a success.
-   The response from Google was a success, but for another action.

When the errorHandler options property is not set, it will throw a Forbidden error by default.

```ts
export type reCAPTCHAErrorHandler = (args: {
	hookArgs: Parameters<CollectionBeforeOperationHook>[0];
	response?: reCAPTCHAResponse;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	error?: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) => any;
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
| invalid-keys           | The secret key is incorrect.                                                    |
