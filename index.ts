import type { Config, ContestInterface, Next, SnapshotExport } from "./interfaces";
import { Snapshot } from "./entities/snapshot";
import { GameCore } from "./entities/gameCore";
import path from "path";

export class Contest implements ContestInterface {
	readonly defaultConfig = {
		backgroundColor: "rgb(15,15,23)",
		chunk: {
			background: `rgb(162, 133, 218)`,
			checkedBackground: `rgba(80, 76, 78, 0.3)`,
		},
		frame: 15,
		gap: 5,
		fieldsCount: {
			height: 10,
			width: 16,
		},
	};

	config;
	snapshots: Snapshot[] = [];
	game: GameCore;

	constructor(payload: { config: Config }) {
		this.config = payload.config;

		const size = {
			height: this.defaultConfig.fieldsCount.height,
			width: this.defaultConfig.fieldsCount.width,
		};
		const game = new GameCore(this, size, []);
		this.game = game;

		const snapshot: Snapshot = new Snapshot(this, game.gameChunks, []);
		this.snapshots = [...this.snapshots, snapshot];
	}

	readonly next: Next = (steps) => {
		const result = this.game.game.makeSteps({ steps });
		const resolvedSteps = result.filteredSteps.resolved.map(({ step }) => step);
		const snapshot = new Snapshot(this, result.gameSnapshot.gameChunks, resolvedSteps);
		this.snapshots = [...this.snapshots, snapshot];
		return { resolved: resolvedSteps, rejected: result.filteredSteps.rejected };
	};

	readonly export: SnapshotExport & {} = {
		imageFile: (...args) =>
			new Promise(async (resolve, reject) => {
				const snapshot = this.snapshots.at(-1);
				if (!snapshot) return resolve();
				try {
					resolve(await snapshot.export.imageFile(...args));
				} catch (e) {
					reject(e);
				}
			}),
		imageString: (...args) =>
			new Promise(async (resolve, reject) => {
				const snapshot = this.snapshots.at(-1);
				if (!snapshot) return resolve(null);
				try {
					resolve(await snapshot.export.imageString(...args));
				} catch (e) {
					reject(e);
				}
			}),
	};
}

let finished = false;
const config: Config = {
	size: {
		height: 200,
		width: 400,
	},
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
	while (!finished) {
		randomize();
		await contest.export.imageFile({ exportPath: path.join(__dirname, "images"), name: "last" });
		await new Promise((resolve) => setTimeout(resolve, 10000));
	}
	console.log("finished \\m/");
	// console.log(await contest.export.imageString());
})();
