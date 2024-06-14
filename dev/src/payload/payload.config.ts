import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';

import reCAPTCHAv3 from '../../../dist/index';
import { Test } from './collections/Test';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
	admin: {
		disable: true,
	},
	collections: [Test],
	telemetry: false,
	secret: 'a-very-secure-secret-lol',
	typescript: {
		outputFile: path.resolve(dirname, 'payload-types.ts'),
	},
	db: mongooseAdapter({
		url: process.env.DATABASE_URI!,
	}),
	editor: lexicalEditor(),
	plugins: [
		reCAPTCHAv3({
			skip: ({ req }) => {
				return req.headers.get('x-skip') === 'blabla';
			},
			secret: process.env.RECAPTCHA_SECRET!,
		}),
	],
});
