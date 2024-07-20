import type { CollectionBeforeOperationHook, Operation } from 'payload';

export type reCAPTCHASkip = (
	args: Parameters<CollectionBeforeOperationHook>[0],
) => boolean;

export interface reCAPTCHAConfig {
	errorHandler?: reCAPTCHAErrorHandler;
	skip?: reCAPTCHASkip;
}

export interface reCAPTCHAPluginConfig extends reCAPTCHAConfig {
	secret: string;
}

export type reCAPTCHAErrorHandler = (args: {
	hookArgs: Parameters<CollectionBeforeOperationHook>[0];
	response?: reCAPTCHAResponse;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	error?: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) => any;

export type reCAPTCHAErrorCode =
	| 'missing-input-secret'
	| 'invalid-input-secret'
	| 'missing-input-response'
	| 'invalid-input-response'
	| 'bad-request'
	| 'timeout-or-duplicate'
	| 'invalid-keys';

export interface reCAPTCHAResponse {
	success: boolean;
	score: number;
	action: string;
	challenge_ts: number;
	hostname: string;
	'error-codes'?: reCAPTCHAErrorCode[];
}

export interface reCAPTCHAOperation extends reCAPTCHAConfig {
	name: Operation;
	action: string;
}

export type HookBuilderArgs = {
	secret: string;
	operations: reCAPTCHAOperation[];
	errorHandler: reCAPTCHAErrorHandler;
	skip?: reCAPTCHASkip;
};

// declare module 'payload' {
// 	export type CollectionConfig = {
// 		custom?: {
// 			recaptcha: reCAPTCHAOperation[];
// 		};
// 	};
// }
