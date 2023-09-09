import type { Config, ContestInterface, Next, SnapshotExport } from "../interfaces";
import { Snapshot } from "./snapshot";
import { GameCore } from "./gameCore";

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
		const game = new GameCore(this, size, payload.config.bank);
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
