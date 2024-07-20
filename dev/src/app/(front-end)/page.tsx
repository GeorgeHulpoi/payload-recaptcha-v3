import Create from './Create';
import CreateBadAction from './CreateBadAction';
import CreateSkip from './CreateSkip';

export default function Home() {
	return (
		<main>
			<CreateBadAction />
			<Create />
			<CreateSkip />
		</main>
	);
}
