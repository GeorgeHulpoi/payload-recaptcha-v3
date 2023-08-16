import {Config, Plugin} from 'payload/config';
import {PluginConfig} from './types';
import {buildBeforeOperationHook} from './hooks/beforeOperation';

const reCAPTCHAv3: (pluginConfig: PluginConfig) => Plugin =
	(pluginConfig: PluginConfig) =>
	(incomingConfig: Config): Config => {
		const {collections} = incomingConfig;

		(collections ?? []).forEach((collection) => {
			if (collection.custom !== undefined && collection.custom.recaptcha !== undefined) {
				const {beforeOperation, ...rest} = collection.hooks as any;

				collection.hooks = {
					...rest,
					beforeOperation: [
						...(beforeOperation ?? []),
						buildBeforeOperationHook({
							secret: pluginConfig.secret,
							operations: collection.custom.recaptcha,
						}),
					],
				};
			}
		});

		return incomingConfig;
	};

export default reCAPTCHAv3;
