import { Forbidden } from 'payload/errors';
import type { CollectionBeforeOperationHook } from 'payload/types';

import axios from 'axios';
import qs from 'qs';
import { getClientIp } from 'request-ip';

import type { reCAPTCHAErrorHandler, reCAPTCHAResponse } from './types';

export class BeforeOperationHookBuilder {
	private secret?: string;
	private operations?: string[];
	private errorHandler: reCAPTCHAErrorHandler = () => {
		throw new Forbidden();
	};

	setSecret(secret: string): BeforeOperationHookBuilder {
		this.secret = secret;
		return this;
	}

	setOperations(operations: string[]): BeforeOperationHookBuilder {
		this.operations = operations;
		return this;
	}

	setErrorHandler(fn: reCAPTCHAErrorHandler): BeforeOperationHookBuilder {
		this.errorHandler = fn;
		return this;
	}

	build(): CollectionBeforeOperationHook {
		const operations = [...(this.operations || [])];
		const secret = this.secret;

		return async ({ args, operation }) => {
			if (operations.includes(operation)) {
				const { req } = args;

				const token = req.get('X-reCAPTCHA-V3');

				if (token === undefined) {
					this.errorHandler();
				}

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
					this.errorHandler(response);
				}
			}

			return args;
		};
	}
}
