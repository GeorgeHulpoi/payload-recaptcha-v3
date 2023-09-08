import { Forbidden } from 'payload/errors';
import type { CollectionBeforeOperationHook } from 'payload/types';

import axios from 'axios';
import qs from 'qs';
import { getClientIp } from 'request-ip';

import type { reCAPTCHAErrorHandler, reCAPTCHAOperation, reCAPTCHAResponse } from './types';

export class BeforeOperationHookBuilder {
	private secret?: string;
	private operations?: reCAPTCHAOperation[];
	private errorHandler: reCAPTCHAErrorHandler = () => {
		throw new Forbidden();
	};

	setSecret(secret: string): BeforeOperationHookBuilder {
		this.secret = secret;
		return this;
	}

	setOperations(operations: reCAPTCHAOperation[]): BeforeOperationHookBuilder {
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
			const op = operations.find((o) => 'name' in o && 'action' in o && o.name === operation);

			if (op !== undefined) {
				const { req } = args;

				const token = req.get('X-reCAPTCHA-V3');

				if (token === undefined) {
					this.errorHandler();
				}

				const data = {
					secret,
					response: token,
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

				if (response.action !== op.action) {
					this.errorHandler(response);
				}
			}

			return args;
		};
	}
}
