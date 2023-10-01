import type { Server } from 'http';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { start } from './dev/server';

describe('Plugin tests', () => {
	let mongod: MongoMemoryServer;
	let server: Server;

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();

		process.env.PAYLOAD_CONFIG_PATH = path.join(__dirname, 'dev', 'payload.config.ts');
		process.env.MONGODB_URI = mongod.getUri();

		server = await start({ local: true });
	});

	afterAll(async () => {
		await mongod.stop();
		server.close();
	});

	it('tests', async () => {
		expect(true).toBe(true);
	});
});
