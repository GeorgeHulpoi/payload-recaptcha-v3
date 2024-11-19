import { test, expect } from '@playwright/test';

test('should throw 403 when is no token provided', async ({ request }) => {
	const res = await request.post(`/api/test`, {
		data: {
			name: 'test',
		},
	});
	expect(res.status()).toEqual(403);
});

test('should throw 403 when when the action is not the same', async ({
	page,
}) => {
	await page.goto('/', { waitUntil: 'networkidle' });
	const [res] = await Promise.all([
		page.waitForResponse('/api/test', { timeout: 5000 }),
		page.getByTestId('create_bad_action').click(),
	]);

	expect(res.status()).toEqual(403);
});

test('should create', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });
	const [res] = await Promise.all([
		page.waitForResponse('/api/test', { timeout: 5000 }),
		page.getByTestId('create').click(),
	]);
	expect(res.status()).toEqual(201);
});

test('should create with skip', async ({ page }) => {
	const resPromise = page.waitForResponse('/api/test');
	await page.goto('/');
	await page.getByTestId('create_skip').click();
	const res = await resPromise;
	expect(res.status()).toEqual(201);
});

test('should create with GraphQL', async ({ request }) => {
	const res = await request.post(`/api/graphql`, {
		data: {
			query: `mutation { createTest(data: {name: "abc"}) { id, name } }`,
		},
		headers: {
			'Content-Type': 'application/json',
		},
	});
	expect(res.status()).toEqual(200);
});

test('should contain `x-recaptcha-v3` in Access-Control-Allow-Headers', async ({
	request,
}) => {
	const res = await request.get(`/api/test`);
	const headers = res.headers();
	expect(headers).toBeDefined();
	const acah =
		headers['access-control-allow-headers'] ||
		headers['Access-Control-Allow-Headers'];
	expect(acah).toBeDefined();
	expect(acah.split(',').map((v) => v.trim())).toContain('x-recaptcha-v3');
});
