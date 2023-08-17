import { buildConfig } from 'payload/config';
import path from 'path';

export default buildConfig({
	serverURL: 'http://localhost:3000',
	admin: {
		webpack: (config) => {
			const newConfig = {
				...config,
				resolve: {
					...config.resolve,
					alias: {
						...(config?.resolve?.alias || {}),
						react: path.join(__dirname, '../node_modules/react'),
						'react-dom': path.join(__dirname, '../node_modules/react-dom'),
						payload: path.join(__dirname, '../node_modules/payload'),
					},
				},
			};
			return newConfig;
		},
	},
	collections: [],
	typescript: {
		outputFile: path.resolve(__dirname, 'payload-types.ts'),
	},
	graphQL: {
		schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
	},
	plugins: [],
});
