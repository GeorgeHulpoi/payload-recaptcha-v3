import type { CollectionConfig } from 'payload';

export const Test: CollectionConfig = {
	slug: 'test',
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
			},
		],
	},
};
