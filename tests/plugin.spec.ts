import type { Server } from 'http';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import payload from 'payload';
import axios from 'axios';

import { start } from './dev/server';

describe('Plugin tests', () => {
	let mongod: MongoMemoryServer;
	let server: Server;

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();

		process.env.PAYLOAD_CONFIG_PATH = path.join(__dirname, 'dev', 'payload.config.ts');
		process.env.MONGODB_URI = mongod.getUri();

		server = await start({ local: false });
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.resetAllMocks();
	});

	afterAll(async () => {
		await mongod.stop();
		server.close();
	});

	it("shouldn't call Google reCAPTCHA while using Local", async () => {
		const post = jest.spyOn(global, 'fetch');

		await payload.create({
			collection: 'test',
			data: {
				name: 'rest',
			},
		});

		expect(post).toHaveBeenCalledTimes(0);
	});

	it("shouldn't call Google reCAPTCHA when using GraphQL", async () => {
		const post = jest.spyOn(global, 'fetch');

		await axios.post('http://localhost:3000/api/graphql', {
			query: `mutation { createTest(data: {name: "abc"}) { id, name } }`,
		});

		expect(post).toHaveBeenCalledTimes(0);
	});

	it('should call Google reCAPTCHA when using REST', async () => {
		const post = jest.spyOn(global, 'fetch').mockImplementation(() =>
			Promise.resolve({
				ok: true,
				json: () => ({
					action: 'create_test',
					success: true,
				}),
			} as any),
		);

		await axios.post(
			'http://localhost:3000/api/test',
			{ name: 'bla' },
			{
				headers: {
					'X-reCAPTCHA-V3': 'token',
				},
			},
		);

		expect(post).toHaveBeenCalledTimes(1);
	});

	// it('should throw Forbidden by default', async () => {
	// 	const response = await fetch('http://localhost:3000/api/test', {
	// 		body: JSON.stringify({ name: 'bla' }),
	// 		headers: {
	// 			'X-reCAPTCHA-V3': 'token',
	// 		},
	// 		method: 'POST',
	// 	});

	// 	expect(response.status).toEqual(403);
	// });
});
