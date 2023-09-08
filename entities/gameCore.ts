import type { Contest } from "../index";
import type {
	ChunkInfo,
	ChunkStatus,
	GameBank,
	GameChunk,
	GameSnapshot,
	Position,
	Prize,
	PrizeBank,
	Step,
	ChunkInterface,
} from "../interfaces";

type Resolved = { step: Step; updatedChunk: GameChunk }[];
type Rejected = Step[];
type FilteredSteps = { resolved: Resolved; rejected: Rejected };
type MakeData = {
	filteredSteps: FilteredSteps;
	gameSnapshot: GameSnapshot;
};

export class GameCore {
	readonly _contest: Contest;
	readonly gameChunks: GameChunk[];
	gameBank: GameBank[];

	constructor(_contest: Contest, fieldSize: { height: number; width: number }, bank: PrizeBank) {
		this._contest = _contest;
		this.gameChunks = this.engine["regular"].generateGameField(fieldSize);
		this.gameBank = this.engine["regular"].generateGameBank(bank);
	}

	readonly engine: {
		[engine: string]: {
			generateGameField: (fieldSize: { height: number; width: number }) => GameChunk[];
			generateGameBank: (bank: PrizeBank) => GameBank[];
			setStep: <S extends Step>(data: { step: S }) => { step: S; updatedChunk: GameChunk | null };
		};
	} = {
		regular: {
			generateGameField: (fieldSize) => {
				const game = this;
				const field = game.chunk.generateField(fieldSize);
				const status: ChunkStatus = { checked: false, available: true };
				const prize = null;
				const step = null;
				return field.map((info) => ({ info, status, prize, step }));
			},
			generateGameBank: (bank) => {
				const game = this;
				const condition: (chunk: GameChunk) => boolean = ({ status }) => status.available && !status.checked;
				return bank.map(({ info, count }) => {
					const chunks = game.chunk.getAllByCondition(condition);
					let indexes: number[] = [];
					while (indexes.length < count) {
						const index = Math.round((chunks.length - 1) * Math.random());
						if (!indexes.includes(index)) indexes = [...indexes, index];
					}
					const positions = indexes.map((i) => chunks[i].info.position);
					return { info, positions, checkedSteps: [] };
				});
			},
			setStep: ({ step }) => {
				const game = this;
				const condition: (chunk: GameChunk) => boolean = (chunk) => chunk.status.available && !chunk.step;
				const chunk = game.chunk.find(step.position);
				let updatedChunk = null;
				if (!!chunk && condition(chunk)) {
					game.chunk.updateChunkStatus(chunk.info.position, { checked: true });
					chunk.step = step;
					updatedChunk = chunk;

					const checkBank = game.bank.checkOnPrize(chunk.info.position);
					checkBank.forEach((bank) => {
						game.chunk.setChunkPrize(step.position, bank.info);
						game.bank.updateChecked(bank.info.id, step);
					});
				}
				if (game.chunk.getAllByCondition(condition).length === 0)
					game._contest.config.onFinish && game._contest.config.onFinish();
				return { step, updatedChunk };
			},
		},
	};

	readonly game: {
		makeSteps: (data: { steps: Step[] }) => MakeData;
	} = {
		makeSteps: ({ steps }) => {
			const result = steps.map((step) => this.engine["regular"].setStep({ step }));
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

	readonly bank: {
		findById: (id: number) => GameBank | null;
		checkOnPrize: (position: Position) => GameBank[];
		updateChecked: (id: number, step: Step) => void;
	} = {
		findById: (id) => {
			const bank = this.gameBank.find(({ info }) => info.id === id);
			return bank ? bank : null;
		},
		checkOnPrize: ([x, y]) => {
			return this.gameBank.filter(({ positions }) => positions.some(([posX, posY]) => posX === x && posY === y));
		},
		updateChecked: (id, step) => {
			const bank = this.bank.findById(id);
			if (bank) bank.checkedSteps = [...bank.checkedSteps, step];
		},
	};

	readonly chunk: ChunkInterface & {
		getAllByCondition: (condition: (chunk: GameChunk) => boolean) => GameChunk[];
		updateChunkStatus: (position: Position, status: Partial<ChunkStatus>) => void;
		setChunkPrize: (position: Position, prize: null | Prize) => void;
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
		updateChunkStatus: (position, status) => {
			const chunk = this.chunk.find(position);
			if (chunk) chunk.status = { ...chunk.status, ...status };
		},
		setChunkPrize: (position, prize) => {
			const chunk = this.chunk.find(position);
			if (chunk) chunk.prize = prize;
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
		getAllByCondition: (condition) => {
			return this.gameChunks.filter(condition);
		},
	};

	readonly #utils = {
		getRandomInteger: ({ from = 0, to = 100 }) => from + Math.floor((to - from) * Math.random()),
	};
}
