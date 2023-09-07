import type {
	Chunk,
	ChunkInfo,
	ChunkInterface,
	Config,
	ContestInterface,
	Create,
	ExportImageFile,
	ExportImageString,
	Next,
	SnapshotInterface,
	Step,
	UtilsInterface,
} from "./interfaces";
import path from "path";
import { Snapshot } from "./entities/snapshot";

export class Contest implements ContestInterface {
	readonly defaultConfig = {
		backgroundColor: "rgb(30,30,50)",
		chunk: {
			background: `rgba(210, 210, 210, 1)`,
			checkedBackground: `rgba(255, 50, 210, 0.3)`,
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

	constructor(payload: { config: Config }) {
		this.config = payload.config;
	}

	readonly #chunk: ChunkInterface = {
		getFieldSize: () => {
			const frameSize = this.defaultConfig.frame;
			const gapSize = this.defaultConfig.gap;
			const counts = this.defaultConfig.fieldsCount;

			const { partsX, partsY, frameX, frameY, gapsX, gapsY } = (() => {
				const partsX = counts.width;
				const partsY = counts.height;
				const frameX = frameSize * 2;
				const frameY = frameSize * 2;
				const gapsX = gapSize * (partsX > 1 ? partsX - 1 : 0);
				const gapsY = gapSize * (partsY > 1 ? partsY - 1 : 0);
				return { partsX, partsY, frameX, frameY, gapsX, gapsY };
			})();

			const height = (this.config.size.height - frameY - gapsY) / partsY;
			const width = (this.config.size.width - frameX - gapsX) / partsX;

			return { height, width };
		},
		getFieldPosition: ([x, y]) => {
			const frameSize = this.defaultConfig.frame;
			const gapSize = this.defaultConfig.gap;
			const size = this.#chunk.getFieldSize();
			const top = frameSize + y * (size.height + gapSize);
			const left = frameSize + x * (size.width + gapSize);
			return { top, left };
		},
		createChunkInfo: ([x, y]) => {
			const size = this.#chunk.getFieldSize();
			const fieldPosition = this.#chunk.getFieldPosition([x, y]);
			return { size, position: [x, y], fieldPosition };
		},
	};

	readonly #snapshot: SnapshotInterface = {
		create: ({ steps }) => {
			const lastSnapshot = this.snapshots.at(-1);
			if (lastSnapshot) {
				const chunks = lastSnapshot.chunks.map((chunk) => {
					const {
						info: {
							position: [chunkX, chunkY],
						},
					} = chunk;
					const checked = steps.some(({ position: [stepX, stepY] }) => chunkX === stepX && chunkY === stepY);
					return checked ? { ...chunk, status: { ...chunk.status, checked } } : chunk;
				});
				return new Snapshot(this, chunks, steps);
			} else {
				return null;
			}
		},
	};

	readonly #utils: UtilsInterface = {
		generateField: ({ height, width }) => {
			const totalChunks = {
				height,
				width,
			};

			let chunks: ChunkInfo[] = [];
			for (let x = 0; x < totalChunks.width; x++) {
				for (let y = 0; y < totalChunks.height; y++) {
					const chunk = this.#chunk.createChunkInfo([x, y]);
					chunks = [...chunks, chunk];
				}
			}
			return chunks;
		},
	};

	readonly create: Create = () => {
		const chunksInfo = this.#utils.generateField({
			height: this.defaultConfig.fieldsCount.height,
			width: this.defaultConfig.fieldsCount.width,
		});
		const snapshot: Snapshot = new Snapshot(
			this,
			chunksInfo.map((info) => ({ info, status: { checked: false } })),
			[]
		);
		this.snapshots = [...this.snapshots, snapshot];
	};

	readonly next: Next = (steps) => {
		type Resolved = { step: Step; chunk: Chunk }[];
		type Rejected = Step[];
		type FilteredSteps = { resolved: Resolved; rejected: Rejected };

		const lastSnapshot = this.snapshots.at(-1);
		if (lastSnapshot) {
			const filteredSteps = steps.reduce<FilteredSteps>(
				(prev, step) => {
					const chunk = lastSnapshot.chunks.find(
						({
							info: {
								position: [x, y],
							},
						}) => x === step.position[0] && y === step.position[1]
					);
					if (!chunk || chunk.status.checked) return { ...prev, rejected: [...prev.rejected, step] };
					return { ...prev, resolved: [...prev.resolved, { chunk, step }] };
				},
				{ resolved: [], rejected: [] }
			);
			const resolvedSteps = filteredSteps.resolved.map(({ step }) => step);
			const snapshot = this.#snapshot.create({ steps: resolvedSteps });
			if (snapshot) {
				this.snapshots = [...this.snapshots, new Snapshot(this, snapshot.chunks, snapshot.lastSteps)];
				return { resolved: resolvedSteps, rejected: filteredSteps.rejected };
			}
		}
		return { resolved: [], rejected: steps };
	};

	readonly exportImageFile: ExportImageFile = async ({
		exportPath = path.resolve(__dirname, "images"),
		name = String(Date.now()),
		format = "png",
	}) => {
		const lastSnapshot = this.snapshots.at(-1);
		if (lastSnapshot) await lastSnapshot.export.imageFile({ exportPath, name, format });
	};

	readonly exportImageString: ExportImageString = async () => {
		const lastSnapshot = this.snapshots.at(-1);
		if (lastSnapshot) return await lastSnapshot.export.imageString();
		return null;
	};
}

const config: Config = {
	size: {
		height: 200,
		width: 400,
	},
};

(async () => {
	const contest = new Contest({ config });
	contest.create();
	await contest.exportImageFile({ name: "test" });
	console.log(contest.next([{ id: 0, position: [2, 1] }]));
	await contest.exportImageFile({ name: "final" });
	console.log(await contest.exportImageString());
})();
