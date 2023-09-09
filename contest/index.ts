import type { Config, Step } from "contest/src/shared/interfaces";
import path from "path";
import { Contest } from "contest/src/entities/contest";
import { ContestEvent } from "contest/src/shared/enums";

let finished = false;
const config: Config = {
	size: {
		height: 600,
		width: 900,
	},
	bank: [
		{ info: { id: 0 }, count: 1 },
		{ info: { id: 1 }, count: 2 },
		{ info: { id: 2 }, count: 4 },
		{ info: { id: 3 }, count: 8 },
	],
	onFinish: () => (finished = true),
	// backgroundImage:
	// 	"https://besthqwallpapers.com/Uploads/14-8-2019/101424/thumb-old-paper-texture-blots-paper-backgrounds-paper-textures-old-paper.jpg",
};

(async () => {
	// Utils
	const random = ({ from = 0, to = 100 }) => from + Math.round((to - from) * Math.random());
	const randomize = () => {
		const sizeX = 16;
		const sizeY = 10;
		const count = 15;
		const from = 5;
		const to = from + count;
		const steps: Step[] = Array.from({ length: random({ from, to }) }).map(() => ({
			id: playersId[random({ to: playersId.length - 1 })],
			position: [random({ from: 0, to: sizeX - 1 }), random({ from: 0, to: sizeY - 1 })],
		}));
		const filteredSteps: Step[] = steps.filter(({ id }, i, array) => {
			const firstIndex = array.findIndex((p) => p.id === id);
			return firstIndex >= 0 && firstIndex === i;
		});
		const mapId: (arr: typeof steps) => number[] = (arr) => arr.map(({ id }) => id);
		console.log(`Total steps: ${filteredSteps.length} from ${steps.length}`);
		console.log("steps", mapId(steps));
		console.log("→ filtered to", mapId(filteredSteps));
		contest.next(filteredSteps);
	};
	const log = () => {
		const chunks = contest.game.gameChunks;
		const checked = chunks.filter(({ status }) => status.checked);
		const checkedPosition = checked.map(({ info: { position } }) => position);
		console.log(checked.length, checkedPosition);
	};

	// Test config
	const testConfig = {
		players: 15,
		imagesDirectory: path.join(__dirname, "images"),
	};

	// Usage
	const playersId = Array.from({ length: random({ to: testConfig.players }) })
		.fill(null)
		.map((_, i) => i + 1);
	const contest = new Contest({ config });
	contest.addEventListener(ContestEvent.finished, () => console.log("finished"));
	await contest.snapshots.at(-1)?.export.imageFile({ exportPath: testConfig.imagesDirectory, name: "first" });
	contest.next([{ id: 0, position: [2, 1] }]);
	await contest.export.imageFile({ exportPath: testConfig.imagesDirectory, name: "image_1" });
	randomize();
	await contest.export.imageFile({ exportPath: testConfig.imagesDirectory, name: "image_2" });
	randomize();
	await contest.export.imageFile({ exportPath: testConfig.imagesDirectory, name: "image_3" });
	randomize();
	await contest.export.imageFile({ exportPath: testConfig.imagesDirectory, name: "last" });
	console.log("finished \\m/");
	// console.log(await contest.export.imageString());
})();
