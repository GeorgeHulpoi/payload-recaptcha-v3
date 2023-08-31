import type { Config, Plugin } from 'payload/config';
import type { reCAPTCHAPluginConfig } from './types';

import { BeforeOperationHookBuilder } from './beforeOperationHookBuilder';
import insertBeforeOperationHook from './insertBeforeOperationHook';

const reCAPTCHAv3: (pluginConfig: reCAPTCHAPluginConfig) => Plugin =
	(pluginConfig: reCAPTCHAPluginConfig) =>
	(incomingConfig: Config): Config => {
		const hookBuilder = new BeforeOperationHookBuilder().setSecret(pluginConfig.secret);
		const newConfig = insertBeforeOperationHook(incomingConfig, hookBuilder);
		return newConfig;
	};

export default reCAPTCHAv3;
