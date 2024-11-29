import { type Config, type Plugin, Forbidden } from 'payload';

import type { reCAPTCHAErrorHandler, reCAPTCHAPluginConfig } from './types.js';
import hookBuilder from './hookBuilder.js';

const defaultErrorHandler: reCAPTCHAErrorHandler = () => {
	throw new Forbidden();
};

const reCAPTCHAv3: (pluginConfig: reCAPTCHAPluginConfig) => Plugin =
	({ secret, errorHandler, skip, scoreThreshold }: reCAPTCHAPluginConfig) =>
	(incomingConfig: Config): Config => {
		const { cors } = incomingConfig;

		const headers =
			typeof cors === 'object' && 'headers' in cors
				? cors.headers || []
				: [];

		const origins =
			cors === '*'
				? '*'
				: Array.isArray(cors)
					? cors
					: typeof cors === 'object' && 'origins' in cors
						? cors.origins
						: [];

		return {
			...(incomingConfig || {}),
			collections: (incomingConfig.collections || []).map(
				(collection) => {
					if (collection.custom?.recaptcha) {
						return {
							...(collection || {}),
							hooks: {
								...(collection.hooks || {}),
								beforeOperation: [
									...(collection.hooks?.beforeOperation ||
										[]),
									hookBuilder({
										secret,
										operations: collection.custom.recaptcha,
										errorHandler:
											errorHandler || defaultErrorHandler,
										skip,
										scoreThreshold: scoreThreshold || 0.7,
									}),
								],
							},
						};
					}

					return collection;
				},
			),
			cors: {
				origins: origins,
				headers: [...headers, 'x-recaptcha-v3'],
			},
		};
	};

export default reCAPTCHAv3;
