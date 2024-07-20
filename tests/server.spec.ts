import { test, expect } from '@playwright/test';

test('should build and start', async ({ request }) => {
	const res = await request.get(`/api/test`);
	expect(res.ok()).toBeTruthy();
});
