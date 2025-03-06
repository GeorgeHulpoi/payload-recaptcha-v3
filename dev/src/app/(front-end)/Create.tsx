'use client';

import { getToken } from './gRECAPTCHA.js';

export default function Create() {
	const create = () => {
		getToken('create_test').then((token) =>
			fetch('/api/test', {
				method: 'POST',
				body: JSON.stringify({
					name: 'test 3',
				}),
				headers: {
					'Content-Type': 'application/json',
					'x-recaptcha-v3': token,
				},
			}),
		);
	};

	return (
		<button data-testid="create" onClick={create}>
			Create
		</button>
	);
}
