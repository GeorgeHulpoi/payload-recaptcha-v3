import type { Config } from 'payload/config';
import type { CollectionConfig } from 'payload/types';
import insertBeforeOperationHook from '../src/insertBeforeOperationHook';
import { BeforeOperationHookBuilder } from '../src/beforeOperationHookBuilder';

describe('insertBeforeOperationHook', () => {
	let incomingConfig: Partial<Config>;
	let testCollection: CollectionConfig;
	let test2Collection: CollectionConfig;
	let test3Collection: CollectionConfig;
	const hook1 = () => {};
	const hook2 = () => {};

	beforeEach(async () => {
		testCollection = {
			slug: 'test',
			fields: [],
			hooks: {
				beforeOperation: [hook1],
				beforeChange: [hook2],
			},
			custom: {
				recaptcha: ['create', 'read'],
			},
		};

		test2Collection = {
			slug: 'test2',
			fields: [],
		};

		test3Collection = {
			slug: 'test3',
			fields: [],
			hooks: {
				beforeOperation: [hook1, hook2],
			},
		};

		incomingConfig = {
			serverURL: 'http://localhost:3000',
			collections: [testCollection, test2Collection, test3Collection],
			plugins: [],
		};
	});

	test('should insert hook', () => {
		const newHook = () => {};
		const hookBuilder = new BeforeOperationHookBuilder();
		const build = jest.spyOn(hookBuilder, 'build').mockReturnValue(newHook);
		const newConfig = insertBeforeOperationHook(incomingConfig as any, hookBuilder);

		// It should not modify the other properties
		expect(newConfig).toEqual(
			expect.objectContaining({
				serverURL: 'http://localhost:3000',
				plugins: [],
			}),
		);

		// It should contain the same collections provided
		expect(newConfig.collections).toHaveLength(3);

		// test2Collection and test3Collection should not be touched
		// This expect verify deep and the newConfig collections are not a refference to the
		// test2Collection and test3Collection
		expect(newConfig.collections).toContain(test2Collection);
		expect(newConfig.collections).toContain(test3Collection);

		// It should not modify the given collection
		expect(testCollection).toEqual(
			expect.objectContaining({
				hooks: {
					beforeOperation: [hook1],
					beforeChange: [hook2],
				},
			}),
		);

		// Search for the `testCollection` in the `newConfig`
		const newTestCollection = newConfig.collections!.find((c) => c.slug === 'test');

		// It should call HookBuilder.build
		expect(build).toHaveBeenCalledTimes(1);

		// It should add the newHook in the right property
		expect(newTestCollection).toEqual(
			expect.objectContaining({
				hooks: {
					beforeOperation: [hook1, newHook],
					beforeChange: [hook2],
				},
			}),
		);

		// It should not modify the rest of the collection
		expect(newTestCollection).toEqual(
			expect.objectContaining({
				slug: 'test',
				fields: [],
				custom: {
					recaptcha: ['create', 'read'],
				},
			}),
		);
	});
});
