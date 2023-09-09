import type { Config } from "./interfaces";
import path from "path";
import { Contest } from "./entities/contest";

let finished = false;
const config: Config = {
	size: {
		height: 200,
		width: 400,
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
	const random = ({ from = 0, to = 100 }) => from + Math.round((to - from) * Math.random());
	const randomize = () => {
		const sizeX = 16;
		const sizeY = 10;
		const count = 15;
		const from = 5;
		const to = from + count;
		contest.next(
			Array.from({ length: random({ from, to }) }).map(() => ({
				id: random({}),
				position: [random({ from: 0, to: sizeX - 1 }), random({ from: 0, to: sizeY - 1 })],
			}))
		);
	};
	const log = () => {
		const chunks = contest.game.gameChunks;
		const checked = chunks.filter(({ status }) => status.checked);
		const checkedPosition = checked.map(({ info: { position } }) => position);
		console.log(checked.length, checkedPosition);
	};

	const contest = new Contest({ config });
	await contest.snapshots.at(-1)?.export.imageFile({ exportPath: path.join(__dirname, "images"), name: "first" });
	contest.next([{ id: 0, position: [2, 1] }]);
	await contest.export.imageFile({ exportPath: path.join(__dirname, "images"), name: "image_1" });
	randomize();
	await contest.export.imageFile({ exportPath: path.join(__dirname, "images"), name: "image_2" });
	randomize();
	await contest.export.imageFile({ exportPath: path.join(__dirname, "images"), name: "image_3" });
	randomize();
	await contest.export.imageFile({ exportPath: path.join(__dirname, "images"), name: "last" });
	console.log("finished \\m/");
	// console.log(await contest.export.imageString());
})();
