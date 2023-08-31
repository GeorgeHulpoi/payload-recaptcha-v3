import type { Config } from 'payload/config';
import type { BeforeOperationHookBuilder } from './beforeOperationHookBuilder';

export default function insertBeforeOperationHook(
	incomingConfig: Config,
	hookBuilder: BeforeOperationHookBuilder,
): Config {
	const newConfig = { ...incomingConfig };

	const { collections } = newConfig;

	newConfig.collections = (collections || []).map((collection) => {
		if (collection.custom?.recaptcha !== undefined) {
			const { hooks, ...restOfCollection } = collection;

			const { beforeOperation, ...restOfHooks } = hooks;

			const hook = hookBuilder.setOperations(collection.custom?.recaptcha).build();

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
