import Create from './Create';
import CreateBadAction from './CreateBadAction';
import CreateSkip from './CreateSkip';
import CreateTest2Score from './CreateTest2Score';

export default function Home() {
	return (
		<main>
			<CreateBadAction />
			<Create />
			<CreateSkip />
			<CreateTest2Score />
		</main>
	);
}
