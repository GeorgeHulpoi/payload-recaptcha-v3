import axios from 'axios';
import * as requestIp from 'request-ip';
import qs from 'qs';

import { APIError, Forbidden } from 'payload/errors';
import { BeforeOperationHookBuilder } from './beforeOperationHookBuilder';
import { reCAPTCHAOperation } from './types';

jest.mock('request-ip', () => {
	return {
		__esModule: true, //    <----- this __esModule: true is important
		...jest.requireActual('request-ip'),
	};
});

describe('BeforeOperationHookBuilder', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('should set secret', () => {
		const builder = new BeforeOperationHookBuilder();
		expect((builder as any).secret).toBeUndefined();
		builder.setSecret('bla bla');
		expect((builder as any).secret).toEqual('bla bla');
	});

	test('should set operations', () => {
		const builder = new BeforeOperationHookBuilder();
		expect((builder as any).operations).toBeUndefined();
		const operations: reCAPTCHAOperation[] = [
			{
				name: 'create',
				action: 'a',
			},
			{
				name: 'update',
				action: 'b',
			},
		];
		builder.setOperations(operations);
		expect((builder as any).operations).toEqual(operations);

		// Should be a refference to the array
		operations.push({
			name: 'delete',
			action: 'c',
		});
		expect((builder as any).operations).toContainEqual({
			name: 'delete',
			action: 'c',
		});
	});

	test('should create function with the right scope 1', () => {
		const builder = new BeforeOperationHookBuilder().setSecret('secret').setOperations([
			{
				name: 'create',
				action: 'create',
			},
			{
				name: 'delete',
				action: 'delete',
			},
		]);
		const hook = builder.build();

		expect(hook).toBeDefined();

		// We can't access the function scope, but we can test the axios function
		const postFn = jest.spyOn(axios, 'post').mockImplementation(() =>
			Promise.resolve({
				data: {
					action: 'create',
					success: true,
				},
			}),
		);
		const getClientIpFn = jest
			.spyOn(requestIp, 'getClientIp')
			.mockImplementation((req: any) => '');

		hook({
			args: {
				req: {
					get: () => '',
				},
			},
			operation: 'create',
		} as any);

		expect(postFn).toHaveBeenCalledWith(
			expect.anything(),
			qs.stringify({
				secret: 'secret',
				response: '',
				remoteip: '',
			}),
			expect.anything(),
		);
	});

	test('should create function with the right scope 2', () => {
		const builder = new BeforeOperationHookBuilder().setSecret('secret').setOperations([
			{
				name: 'create',
				action: 'create',
			},
			{
				name: 'delete',
				action: 'delete',
			},
		]);
		const hook = builder.build();

		expect(hook).toBeDefined();

		// We can't access the function scope, but we can test the axios function
		const postFn = jest.spyOn(axios, 'post').mockImplementation(() =>
			Promise.resolve({
				data: {
					success: true,
				},
			}),
		);
		const getClientIpFn = jest
			.spyOn(requestIp, 'getClientIp')
			.mockImplementation((req: any) => '');

		hook({
			args: {
				req: {
					get: () => '',
				},
			},
			operation: 'update',
		} as any);

		expect(postFn).not.toHaveBeenCalled();
	});

	test('should create function with the right scope 3', () => {
		const builder = new BeforeOperationHookBuilder().setSecret('secret').setOperations([
			{
				name: 'create',
				action: 'create_action',
			},
			{
				name: 'delete',
				action: 'delete_action',
			},
		]);
		const hook = builder.build();

		expect(hook).toBeDefined();

		// We can't access the function scope, but we can test the axios function
		const postFn = jest.spyOn(axios, 'post').mockImplementation(() =>
			Promise.resolve({
				data: {
					action: 'delete_action',
					success: true,
				},
			}),
		);
		const getClientIpFn = jest
			.spyOn(requestIp, 'getClientIp')
			.mockImplementation((req: any) => '');

		hook({
			args: {
				req: {
					get: () => '',
				},
			},
			operation: 'delete',
		} as any);

		expect(postFn).toHaveBeenCalledWith(
			expect.anything(),
			qs.stringify({
				secret: 'secret',
				response: '',
				remoteip: '',
			}),
			expect.anything(),
		);
	});

	test('should return args', async () => {
		const builder = new BeforeOperationHookBuilder().setSecret('secret').setOperations([
			{
				name: 'create',
				action: 'action',
			},
		]);

		const hook = builder.build();

		const postFn = jest.spyOn(axios, 'post').mockImplementation(() =>
			Promise.resolve({
				data: {
					action: 'action',
					success: true,
				},
			}),
		);

		const getClientIpFn = jest
			.spyOn(requestIp, 'getClientIp')
			.mockImplementation((req: any) => '127.0.0.1');

		const args = {
			req: {
				get: () => 'token',
			},
		};

		const ret = await hook({
			args,
			operation: 'create',
		} as any);

		expect(postFn).toHaveBeenCalledWith(
			expect.anything(),
			qs.stringify({
				secret: 'secret',
				response: 'token',
				remoteip: '127.0.0.1',
			}),
			expect.anything(),
		);

		expect(ret).toEqual(args);
	});

	test('should call the default error handler', async () => {
		const builder = new BeforeOperationHookBuilder().setSecret('secret').setOperations([
			{
				name: 'create',
				action: 'action',
			},
		]);

		const hook = builder.build();

		const postFn = jest.spyOn(axios, 'post').mockImplementation(() =>
			Promise.resolve({
				data: {
					action: 'action',
					success: false,
				},
			}),
		);

		const getClientIpFn = jest
			.spyOn(requestIp, 'getClientIp')
			.mockImplementation((req: any) => '127.0.0.1');

		const args = {
			req: {
				get: () => 'token',
			},
		};

		expect(
			hook({
				args,
				operation: 'create',
			} as any),
		).rejects.toBeInstanceOf(Forbidden);
	});

	test('should call the custom error handler', async () => {
		const errorHandler = () => {
			throw new APIError('test');
		};

		const builder = new BeforeOperationHookBuilder()
			.setSecret('secret')
			.setOperations([
				{
					name: 'create',
					action: 'action',
				},
			])
			.setErrorHandler(errorHandler);

		const hook = builder.build();

		const postFn = jest.spyOn(axios, 'post').mockImplementation(() =>
			Promise.resolve({
				data: {
					action: 'action',
					success: false,
				},
			}),
		);

		const getClientIpFn = jest
			.spyOn(requestIp, 'getClientIp')
			.mockImplementation((req: any) => '127.0.0.1');

		const args = {
			req: {
				get: () => 'token',
			},
		};

		expect(
			hook({
				args,
				operation: 'create',
			} as any),
		).rejects.toBeInstanceOf(APIError);
	});

	test('mistaken action should throw Forbidden', async () => {
		const builder = new BeforeOperationHookBuilder().setSecret('secret').setOperations([
			{
				name: 'create',
				action: 'action',
			},
		]);

		const hook = builder.build();

		const postFn = jest.spyOn(axios, 'post').mockImplementation(() =>
			Promise.resolve({
				data: {
					action: 'wrong_action',
					success: true,
				},
			}),
		);

		const getClientIpFn = jest
			.spyOn(requestIp, 'getClientIp')
			.mockImplementation((req: any) => '127.0.0.1');

		const args = {
			req: {
				get: () => 'token',
			},
		};

		expect(
			hook({
				args,
				operation: 'create',
			} as any),
		).rejects.toBeInstanceOf(Forbidden);
	});
});
