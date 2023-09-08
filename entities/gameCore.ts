import type { Contest } from "../index";
import type { ChunkInfo, GameBank, GameChunk, GameSnapshot, PrizeBank, Step } from "../interfaces";
import { Chunk, ChunkInterface } from "../interfaces";

type Resolved = { step: Step; updatedChunk: Chunk }[];
type Rejected = Step[];
type FilteredSteps = { resolved: Resolved; rejected: Rejected };
type MakeData = {
	filteredSteps: FilteredSteps;
	gameSnapshot: GameSnapshot;
};

export class GameCore {
	readonly _contest: Contest;
	readonly gameChunks: GameChunk[];
	_gameBank: GameBank[] = [];
	get gameBank() {
		return this._gameBank;
	}
	private set gameBank(bank) {
		this._gameBank = bank;
	}

	constructor(_contest: Contest, fieldSize: { height: number; width: number }, bank: PrizeBank) {
		this._contest = _contest;
		this.gameChunks = this.chunk
			.generateField(fieldSize)
			.map((info) => ({ info, status: { checked: false, available: true }, prize: null, step: null }));
		bank.forEach(({ info, count }) => {
			const positions = this.chunk.getPositions(count);
			this.gameBank = [...this.gameBank, { info, positions }];
		});
	}

	readonly game: {
		setStep: <S extends Step>(data: { step: S }) => { step: S; updatedChunk: GameChunk | null };
		makeSteps: (data: { steps: Step[] }) => MakeData;
	} = {
		setStep: ({ step }) => {
			const condition: (chunk: GameChunk) => boolean = (chunk) => chunk.status.available && !chunk.step;
			const chunk = this.chunk.find(step.position);
			let updatedChunk = null;
			if (!!chunk && condition(chunk)) {
				chunk.status.available = false;
				chunk.status.checked = true;
				chunk.step = step;
				updatedChunk = chunk;
			}
			if (this.chunk.getAllByCondition(condition).length === 0)
				this._contest.config.onFinish && this._contest.config.onFinish();
			return { step, updatedChunk };
		},
		makeSteps: ({ steps }) => {
			const result = steps.map((step) => this.game.setStep({ step }));
			const filteredSteps = result.reduce<FilteredSteps>(
				(prev, { step, updatedChunk }) => {
					if (updatedChunk) return { ...prev, resolved: [...prev.resolved, { step, updatedChunk }] };
					return { ...prev, rejected: [...prev.rejected, step] };
				},
				{ resolved: [], rejected: [] }
			);
			const gameSnapshot = this.snapshot.create();
			return { filteredSteps, gameSnapshot };
		},
	};

	readonly snapshot: {
		create: () => GameSnapshot;
	} = {
		create: () => ({ gameChunks: this.gameChunks }),
	};

	readonly chunk: ChunkInterface & {
		getAllByCondition: (condition: (chunk: GameChunk) => boolean) => GameChunk[];
	} = {
		getFieldSize: () => {
			const frameSize = this._contest.defaultConfig.frame;
			const gapSize = this._contest.defaultConfig.gap;
			const counts = this._contest.defaultConfig.fieldsCount;

			const { partsX, partsY, frameX, frameY, gapsX, gapsY } = (() => {
				const partsX = counts.width;
				const partsY = counts.height;
				const frameX = frameSize * 2;
				const frameY = frameSize * 2;
				const gapsX = gapSize * (partsX > 1 ? partsX - 1 : 0);
				const gapsY = gapSize * (partsY > 1 ? partsY - 1 : 0);
				return { partsX, partsY, frameX, frameY, gapsX, gapsY };
			})();

			const height = (this._contest.config.size.height - frameY - gapsY) / partsY;
			const width = (this._contest.config.size.width - frameX - gapsX) / partsX;

			return { height, width };
		},
		getFieldPosition: ([x, y]) => {
			const frameSize = this._contest.defaultConfig.frame;
			const gapSize = this._contest.defaultConfig.gap;
			const size = this.chunk.getFieldSize();
			const top = frameSize + y * (size.height + gapSize);
			const left = frameSize + x * (size.width + gapSize);
			return { top, left };
		},
		createChunkInfo: ([x, y]) => {
			const size = this.chunk.getFieldSize();
			const fieldPosition = this.chunk.getFieldPosition([x, y]);
			return { size, position: [x, y], fieldPosition };
		},
		generateField: ({ height, width }) => {
			const totalChunks = {
				height,
				width,
			};

			let chunks: ChunkInfo[] = [];
			for (let x = 0; x < totalChunks.width; x++) {
				for (let y = 0; y < totalChunks.height; y++) {
					const chunk = this.chunk.createChunkInfo([x, y]);
					chunks = [...chunks, chunk];
				}
			}
			return chunks;
		},
		checkPositionsEqual: (
			{
				info: {
					position: [firstX, firstY],
				},
			},
			{
				info: {
					position: [secondX, secondY],
				},
			}
		) => {
			return firstX === secondX && firstY === secondY;
		},
		getPositions: (count, onlyFree) => {
			const chunks = onlyFree ? this.gameChunks.filter((c) => c.status.checked) : this.gameChunks;
			let selectedChunks: GameChunk[] = [];
			return Array.from({ length: count > chunks.length ? chunks.length : count }).map(() => {
				const index = this.#utils.getRandomInteger({ from: 0, to: chunks.length - 1 });
				let chunk = chunks[index];

				while (selectedChunks.some((c) => this.chunk.checkPositionsEqual(c, chunk))) {
					selectedChunks = [...selectedChunks, chunk];
				}

				return chunk.info.position;
			});
		},
		find: ([x, y]) => {
			const chunk = this.gameChunks.find(
				({
					info: {
						position: [chunkX, chunkY],
					},
				}) => x === chunkX && y === chunkY
			);
			return chunk ? chunk : null;
		},
		getAllByCondition: (condition) => this.gameChunks.filter(condition),
	};

	readonly #utils = {
		getRandomInteger: ({ from = 0, to = 100 }) => from + Math.floor((to - from) * Math.random()),
	};
}
