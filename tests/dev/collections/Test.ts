import type { CollectionConfig } from 'payload/types';

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
			{
				name: 'update',
				action: 'update_test',
			},
		],
	},
};
