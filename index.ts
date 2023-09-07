import type {Canvas, CanvasRenderingContext2D} from "canvas";
import fs from "fs";
import path from "path";
import {createCanvas} from "canvas";

interface Config {
	height: number;
	width: number;
	background?: string;
}

interface Snapshot {
	chunks: Chunk[];
	steps: Step[];
}

interface Step {
	id: number;
	position: Position;
}

interface Chunk {
	status: ChunkStatus;
	info: ChunkInfo;
}
interface ChunkStatus {
	checked: boolean;
}
interface ChunkInfo {
	size: Size;
	position: Position;
	fieldPosition: FieldPosition;
}

type Size = { height: number; width: number; };
type Position = [x: number, y: number];
type FieldPosition = { top: number; left: number; };

class Contest {
	readonly defaultConfig = {
		background: 'rgb(60,60,60)',
		frame: 4,
		gap: 2,
		fieldsCount: {
			height: 2,
			width: 3,
		}
	}

	config: Config;
	canvas: Canvas;
	snapshots: Snapshot[] = [];

	constructor(payload: { config: Config }) {
		this.config = payload.config;
		this.canvas = createCanvas(payload.config.width, payload.config.height);
	}

	readonly #chunk: {
		getFieldSize: () => Size;
		getFieldPosition: (position: Position) => FieldPosition;
		createChunkInfo: (position: Position) => ChunkInfo;
	} = {
		getFieldSize: () => {
			const frameSize = this.defaultConfig.frame;
			const gapSize = this.defaultConfig.gap;
			const height = this.config.height - frameSize * 2 - gapSize * (this.defaultConfig.fieldsCount.height - 1);
			const width = this.config.width - frameSize * 2 - gapSize * (this.defaultConfig.fieldsCount.width - 1);
			return {height, width};
		},
		getFieldPosition: ([x, y]) => {
			const frameSize = this.defaultConfig.frame;
			const gapSize = this.defaultConfig.gap;
			const size = this.#chunk.getFieldSize();
			const top = frameSize + (y - 1) * (size.height + gapSize);
			const left = frameSize + (x - 1) * (size.width + gapSize);
			return {top, left};
		},
		createChunkInfo: ([x, y]) => {
			const size = this.#chunk.getFieldSize();
			const fieldPosition = this.#chunk.getFieldPosition([x, y]);
			return {size, position: [x, y], fieldPosition};
		},
	}

	readonly #drawer: {
		fillChunk: (position: {size: Size, position: FieldPosition}, options: { color: string; }) => void;
	} = {
		fillChunk: ({size: { height, width }, position: {top, left}}, {color}) => {
			const ctx = this.canvas.getContext('2d');
			ctx.fillStyle = color;
			ctx.fillRect(left, top, width, height);
		}
	}

	readonly #generateField: (size: { height?: number; width?: number }) => ChunkInfo[] = ({height = 2, width = 3}) => {
		const backgroundColor = this.config.background || this.defaultConfig.background;
		const totalChunks = {
			height,
			width,
		}

		const ctx = this.canvas.getContext('2d');
		ctx.fillStyle = backgroundColor;
		ctx.fillRect(0, 0, config.width, config.width);

		let chunks: ChunkInfo[] = [];
		for (let x = 0; x < totalChunks.width; x++) {
			for (let y = 0; y < totalChunks.height; y++) {
				const chunk = this.#chunk.createChunkInfo([x, y]);
				this.#drawer.fillChunk({position: chunk.fieldPosition, size: chunk.size}, {color: `rgba(210, 210, 210, 1)`});
				chunks = [...chunks, chunk];
			}
		}
		return chunks;
	}

	readonly create = () => {
		const chunksInfo = this.#generateField({});
		const snapshot: Snapshot = {
			chunks: chunksInfo.map((info) => ({info, status: { checked: false }})),
			steps: [],
		}
		this.snapshots = [...this.snapshots, snapshot];
	}

	readonly next: (steps: Step[]) => void = (steps) => {
		const lastSnapshot = this.snapshots.at(-1);
		if (lastSnapshot) {
			// logic of steps => result of rejected and resolved steps
			const filteredSteps = steps.reduce((prev, step) => prev, {resolved: [], rejected: []});

			return { resolved: filteredSteps.resolved.map(({step}) => step), rejected: filteredSteps.rejected };
		}
	}

	readonly exportImageFile = ({
		exportPath = path.resolve(__dirname, 'images'),
		name = String(Date.now()),
		format = 'png'
	}) => {
		const out = fs.createWriteStream(path.join(exportPath, `${name}.${format}`));
		const stream = this.canvas.createPNGStream();
		stream.pipe(out);
		out.on('finish', () => console.log(`The ${name}.${format} file was created.`));
	}

	readonly exportImageString = () => {
		const bufferedImage = this.canvas.toBuffer('image/png');
		return Buffer.from(bufferedImage).toString('base64');
	}
}

const config: Config = {
	height: 200,
	width: 400,
}

const contest = new Contest({config});
contest.exportImageFile({name: "demo"});
console.log(contest.exportImageString());


