import type { Config } from 'payload/config';
import type { BeforeOperationHookBuilder } from './beforeOperationHookBuilder';
import type { reCAPTCHAOperation } from './types';

export default function insertBeforeOperationHook(
	incomingConfig: Config,
	hookBuilder: BeforeOperationHookBuilder,
): Config {
	const newConfig = { ...incomingConfig };

	const { collections } = newConfig;

	newConfig.collections = (collections || []).map((collection) => {
		if (collection.custom?.recaptcha !== undefined) {
			const { hooks, ...restOfCollection } = collection;

			const { beforeOperation, ...restOfHooks } = hooks || {};

			const operations: reCAPTCHAOperation[] = collection.custom?.recaptcha;
			const hook = hookBuilder.setOperations(operations).build();

			return {
				...restOfCollection,
				hooks: {
					...restOfHooks,
					beforeOperation: [...(beforeOperation || []), hook],
				},
			};
		}

		return collection;
	});

	return newConfig;
}
