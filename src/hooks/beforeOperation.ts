import type { CollectionBeforeOperationHook } from 'payload/types';
import { Forbidden } from 'payload/errors';

import axios from 'axios';
import { getClientIp } from 'request-ip';
import qs from 'qs';

interface Args {
	operations: string[];
	secret: string;
}

type reCAPTCHAErrorCode =
	| 'missing-input-secret'
	| 'invalid-input-secret'
	| 'missing-input-response'
	| 'invalid-input-response'
	| 'bad-request'
	| 'timeout-or-duplicate'
	| 'invalid-keys';

interface reCAPTCHAResponse {
	success: boolean;
	challenge_ts: number; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
	hostname: string; // the hostname of the site where the reCAPTCHA was solved
	'error-codes'?: reCAPTCHAErrorCode[];
}

export const buildBeforeOperationHook =
	({ operations, secret }: Args): CollectionBeforeOperationHook =>
	async ({ args, operation }) => {
		if (operations.includes(operation)) {
			const { req } = args;

			const data = {
				secret,
				response: req.get('X-reCAPTCHA-V3'),
				remoteip: getClientIp(req),
			};

			// reCAPTCHA accepts only x-www-form-urlencoded
			// https://stackoverflow.com/a/52416003/5796307
			const response: reCAPTCHAResponse = await axios
				.post('https://www.google.com/recaptcha/api/siteverify', qs.stringify(data), {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				})
				.then((res) => res.data);

			if (!response.success) {
				throw new Forbidden();
			}
		}

		return args;
	};
