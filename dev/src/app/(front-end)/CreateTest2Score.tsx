'use client';

import { getToken } from './gRECAPTCHA.js';

export default function CreateTest2Score() {
	const create = () => {
		getToken('create_test').then((token) =>
			fetch('/api/test2', {
				method: 'POST',
				body: JSON.stringify({
					name: 'test 4',
				}),
				headers: {
					'Content-Type': 'application/json',
					'x-recaptcha-v3': token,
				},
			}),
		);
	};

	return (
		<button data-testid="create-test-2-score" onClick={create}>
			Create Test 2 Score
		</button>
	);
}
