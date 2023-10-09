/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	transform: {
		'^.+\\.(t|j)sx?$': '<rootDir>/node_modules/@swc/jest',
	},
	moduleNameMapper: {
		'\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
			'<rootDir>/tests/dev/mocks/fileStub.js',
		'\\.(css|scss)$': '<rootDir>/tests/dev/mocks/fileStub.js',
	},
};
