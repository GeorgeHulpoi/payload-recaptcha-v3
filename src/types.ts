export interface reCAPTCHAPluginConfig {
	secret: string;
	errorHandler?: reCAPTCHAErrorHandler;
}

export type reCAPTCHAErrorHandler = (response: reCAPTCHAResponse) => void;

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
	challenge_ts: number; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
	hostname: string; // the hostname of the site where the reCAPTCHA was solved
	'error-codes'?: reCAPTCHAErrorCode[];
}
