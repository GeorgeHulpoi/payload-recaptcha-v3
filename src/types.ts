export interface reCAPTCHAPluginConfig {
	secret: string;
	errorHandler?: reCAPTCHAErrorHandler;
}

export type reCAPTCHAErrorHandler = (response?: reCAPTCHAResponse) => void;

export type reCAPTCHAOperations =
	| 'create'
	| 'read'
	| 'update'
	| 'delete'
	| 'login'
	| 'refresh'
	| 'forgotPassword';

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

export interface reCAPTCHAOperation {
	name: reCAPTCHAOperations;
	action: string;
}
