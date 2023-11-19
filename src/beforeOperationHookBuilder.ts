import { Forbidden } from 'payload/errors';
import type { CollectionBeforeOperationHook } from 'payload/types';

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

				if (req && req.payloadAPI === 'REST') {
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
					const response = await fetch(
						'https://www.google.com/recaptcha/api/siteverify',
						{
							method: 'POST',
							body: qs.stringify(data),
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded',
							},
						},
					)
						.then((res) => res.json())
						.then((res) => res.data)
						.catch(() => undefined);

					if (!response || response.success === false || response.action !== op.action) {
						this.errorHandler(response);
					}
				}
			}

			return args;
		};
	}
}
