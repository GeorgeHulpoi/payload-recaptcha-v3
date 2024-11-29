import type { CollectionConfig } from 'payload';

export const Test2: CollectionConfig = {
	slug: 'test2',
	access: {
		read: () => true,
		create: () => true,
		update: () => true,
		delete: () => true,
	},
	fields: [
		{
			name: 'name',
			type: 'text',
		},
	],
	custom: {
		recaptcha: [
			{
				name: 'create',
				action: 'create_test',
                scoreThreshold: 0.95,
			},
		],
	},
};
