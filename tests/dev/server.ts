import express from 'express';
import type { Server } from 'http';
import payload from 'payload';

const app = express();

export const start = async (args: { local: boolean } = { local: false }): Promise<Server> => {
	const { local } = args;
	await payload.init({
		local,
		secret: process.env.PAYLOAD_SECRET || 'here-is-a-secret',
		express: app,
	});

	return app.listen(3000);
};

// when build.js is launched directly
if (module.id === require.main?.id) {
	start();
}
