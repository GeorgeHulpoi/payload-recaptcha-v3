'use client';

import { getToken } from './gRECAPTCHA.js';

export default function CreateBadAction() {
	const createBadAction = () => {
		getToken('submit').then((token) =>
			fetch('/api/test', {
				method: 'POST',
				body: JSON.stringify({
					name: 'test 2',
				}),
				headers: {
					'Content-Type': 'application/json',
					'x-recaptcha-v3': token,
				},
			}),
		);
	};

	return (
		<button data-testid="create_bad_action" onClick={createBadAction}>
			Create (bad action)
		</button>
	);
}
