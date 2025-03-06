import Create from './Create.js';
import CreateBadAction from './CreateBadAction.js';
import CreateSkip from './CreateSkip.js';
import CreateTest2Score from './CreateTest2Score.js';

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
