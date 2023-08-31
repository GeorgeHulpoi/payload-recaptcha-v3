import axios from 'axios';
import * as requestIp from 'request-ip';
import qs from 'qs';

import { APIError, Forbidden } from 'payload/errors';
import { BeforeOperationHookBuilder } from './beforeOperationHookBuilder';

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
		const operations = ['a', 'b'];
		builder.setOperations(operations);
		expect((builder as any).operations).toEqual(operations);

		// Should be a refference to the array
		operations.push('c');
		expect((builder as any).operations).toContain('c');
	});

	test('should create function with the right scope 1', () => {
		const builder = new BeforeOperationHookBuilder()
			.setSecret('secret')
			.setOperations(['create', 'delete']);
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
		const builder = new BeforeOperationHookBuilder()
			.setSecret('secret')
			.setOperations(['create', 'delete']);
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
		const builder = new BeforeOperationHookBuilder()
			.setSecret('secret')
			.setOperations(['create', 'delete']);
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
		const builder = new BeforeOperationHookBuilder()
			.setSecret('secret')
			.setOperations(['create']);

		const hook = builder.build();

		const postFn = jest.spyOn(axios, 'post').mockImplementation(() =>
			Promise.resolve({
				data: {
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
		const builder = new BeforeOperationHookBuilder()
			.setSecret('secret')
			.setOperations(['create']);

		const hook = builder.build();

		const postFn = jest.spyOn(axios, 'post').mockImplementation(() =>
			Promise.resolve({
				data: {
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
			.setOperations(['create'])
			.setErrorHandler(errorHandler);

		const hook = builder.build();

		const postFn = jest.spyOn(axios, 'post').mockImplementation(() =>
			Promise.resolve({
				data: {
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
});
