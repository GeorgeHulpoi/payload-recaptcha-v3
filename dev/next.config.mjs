import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (webpackConfig) => {
		webpackConfig.resolve.extensionAlias = {
			'.cjs': ['.cts', '.cjs'],
			'.js': ['.ts', '.tsx', '.js', '.jsx'],
			'.mjs': ['.mts', '.mjs'],
		}

		return webpackConfig
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
}

export default withPayload(nextConfig)