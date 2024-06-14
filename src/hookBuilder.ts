import 'server-only';

import { headers } from 'next/headers.js';
import type { CollectionBeforeOperationHook } from 'payload';
import qs from 'qs';

import type { HookBuilderArgs, reCAPTCHAOperation } from './types.js';

export default function hookBuilder({
	secret,
	operations,
	errorHandler,
	skip,
}: HookBuilderArgs): CollectionBeforeOperationHook {
	return async (args) => {
		const {
			operation,
			req: { payloadAPI, payload },
		} = args;
		const op = operations.find(
			(o: reCAPTCHAOperation) =>
				'name' in o && 'action' in o && o.name === operation,
		);

		if (op) {
			if (payloadAPI === 'REST') {
				const skipFn = op.skip || skip;

				if (skipFn && skipFn(args)) {
					return args.args;
				}

				const headersList = headers();
				const token = headersList.get('x-recaptcha-v3');

				const errorHandlerFn = op.errorHandler || errorHandler;

				if (!token) {
					return errorHandlerFn({
						hookArgs: args,
					});
				}

				const data = {
					secret,
					response: token,
					remoteip: headersList.get('x-forwarded-for'),
				};

				let error;

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
					.catch((err) => {
						payload.logger.error(
							err,
							'Something went wrong during token verification.',
						);
						error = err;
						return undefined;
					});

				if (
					!response ||
					response.success === false ||
					response.action !== op.action
				) {
					return errorHandlerFn({
						hookArgs: args,
						response,
						error,
					});
				}
			}
		}

		return args.args;
	};
}
