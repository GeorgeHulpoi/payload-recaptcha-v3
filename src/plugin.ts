import type { Config, Plugin } from 'payload/config';
import type { PluginConfig } from './types';
import { buildBeforeOperationHook } from './hooks/beforeOperation';

const reCAPTCHAv3: (pluginConfig: PluginConfig) => Plugin =
	(pluginConfig: PluginConfig) =>
	(incomingConfig: Config): Config => {
		const newConfig = { ...incomingConfig };

		const { collections } = newConfig;

		newConfig.collections = (collections || []).map((collection) => {
			if (collection.custom?.recaptcha !== undefined) {
				const { hooks, ...restOfCollection } = collection;

				const { beforeOperation, ...restOfHooks } = hooks;

				return {
					...restOfCollection,
					hooks: {
						...restOfHooks,
						beforeOperation: [
							...(beforeOperation || []),
							buildBeforeOperationHook({
								secret: pluginConfig.secret,
								operations: collection.custom.recaptcha,
							}),
						],
					},
				};
			}

			return collection;
		});

		return newConfig;
	};

export default reCAPTCHAv3;
