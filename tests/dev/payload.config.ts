import path from 'path';

import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { buildConfig } from 'payload/config';

import reCAPTCHAv3 from '../../src';
import { Test } from './collections/Test';

// @ts-expect-error
export default buildConfig({
	serverURL: 'http://localhost:3000',
	collections: [Test],
	db: mongooseAdapter({
		url: process.env.MONGODB_URI!,
	}),
	typescript: {
		outputFile: path.resolve(__dirname, 'payload-types.ts'),
	},
	graphQL: {
		schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
	},
	plugins: [
		reCAPTCHAv3({
			secret: 'random',
		}),
	],
});
