import type { Config, ContestInterface, Create, Next } from "./interfaces";
import { Snapshot } from "./entities/snapshot";
import { GameCore } from "./entities/gameCore";

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
		this.game = new GameCore(this, size, []);
	}

	readonly create: Create = () => {
		const snapshot: Snapshot = new Snapshot(this, this.game.gameChunks, []);
		this.snapshots = [...this.snapshots, snapshot];
	};

	readonly next: Next = (steps) => {
		const result = this.game.game.makeSteps({ steps });
		const resolvedSteps = result.filteredSteps.resolved.map(({ step }) => step);
		const snapshot = new Snapshot(this, result.gameSnapshot.gameChunks, resolvedSteps);
		this.snapshots = [...this.snapshots, snapshot];
		return { resolved: resolvedSteps, rejected: result.filteredSteps.rejected };
	};
}

const config: Config = {
	size: {
		height: 200,
		width: 400,
	},
	// backgroundImage:
	// 	"https://besthqwallpapers.com/Uploads/14-8-2019/101424/thumb-old-paper-texture-blots-paper-backgrounds-paper-textures-old-paper.jpg",
};

(async () => {
	const random = ({ from = 0, to = 100 }) => from + Math.floor((to - from) * Math.random());
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

	const contest = new Contest({ config });
	contest.create();
	await contest.snapshots.at(-1)?.export.imageFile({ name: "start" });
	contest.next([{ id: 0, position: [2, 1] }]);
	await contest.snapshots.at(-1)?.export.imageFile({ name: "image_1" });
	randomize();
	await contest.snapshots.at(-1)?.export.imageFile({ name: "image_2" });
	randomize();
	await contest.snapshots.at(-1)?.export.imageFile({ name: "image_3" });
	randomize();
	await contest.snapshots.at(-1)?.export.imageFile({ name: "final" });
	// console.log(await contest.exportImageString());
})();
