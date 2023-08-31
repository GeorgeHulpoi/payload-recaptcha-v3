import type { CollectionConfig } from 'payload/types';

export const Test: CollectionConfig = {
	slug: 'test',
	fields: [],
	custom: {
		recaptcha: ['create', 'read'],
	},
};
