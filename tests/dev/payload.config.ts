import { buildConfig } from 'payload/config';
import path from 'path';

import { Test } from './collections/Test';

export default buildConfig({
	serverURL: 'http://localhost:3000',
	collections: [Test],
	typescript: {
		outputFile: path.resolve(__dirname, 'payload-types.ts'),
	},
	graphQL: {
		schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
	},
	plugins: [],
});
