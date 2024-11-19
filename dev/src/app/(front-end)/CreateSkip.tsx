'use client';

export default function CreateSkip() {
	const createSkip = () => {
		fetch('/api/test', {
			method: 'POST',
			body: JSON.stringify({
				name: 'test 4',
			}),
			headers: {
				'Content-Type': 'application/json',
				'x-skip': 'blabla',
			},
		});
	};

	return (
		<button data-testid="create_skip" onClick={createSkip}>
			Create (skip)
		</button>
	);
}
