import type { Canvas } from "canvas";
import type { Chunk, DrawInterface, ExportImageFile, ExportImageString, Step } from "../interfaces";
import type { Contest } from "../index";
import path from "path";
import fs from "fs";
import { createCanvas, Image } from "canvas";
import { SnapshotData } from "../interfaces";

export class Snapshot implements SnapshotData {
	_contest: Contest;
	canvas: Canvas;
	chunks: Chunk[];
	lastSteps: Step[];

	constructor(_contest: Contest, chunks: Chunk[], lastSteps: Step[]) {
		this._contest = _contest;
		this.canvas = createCanvas(_contest.config.size.width, _contest.config.size.height);
		this.chunks = JSON.parse(JSON.stringify(chunks));
		this.lastSteps = JSON.parse(JSON.stringify(lastSteps));
	}

	readonly #drawer: DrawInterface = {
		getContext: () => this.canvas.getContext("2d"),
		redraw: async () => {
			// clearing
			this.#drawer.clearField();

			// before async
			const draw = () => {
				this.#drawer.drawChunks(this.chunks);
			};
			draw();

			// async
			if (this._contest.config.backgroundImage)
				await this.#drawer.drawBackgroundImage(this._contest.config.backgroundImage);

			// after async
			draw();
		},
		drawBackgroundImage: async (link) =>
			new Promise((resolve) => {
				const ctx = this.#drawer.getContext();
				const image = new Image();
				image.onload = () => {
					ctx.drawImage(image, 0, 0, this._contest.config.size.width, this._contest.config.size.height);
					resolve();
				};
				image.src = link;
			}),
		clearField: () => {
			const backgroundColor = this._contest.config.backgroundColor || this._contest.defaultConfig.backgroundColor;

			const ctx = this.#drawer.getContext();
			ctx.fillStyle = backgroundColor;
			ctx.fillRect(0, 0, this._contest.config.size.width, this._contest.config.size.height);
		},
		drawChunks: (chunks) => {
			chunks.forEach(({ info: { size, fieldPosition }, status }) => {
				if (status.checked) {
					this.#drawer.fillChunk(
						{ size, position: fieldPosition },
						{ color: this._contest.defaultConfig.chunk.checkedBackground }
					);
				} else {
					this.#drawer.fillChunk(
						{ size, position: fieldPosition },
						{ color: this._contest.defaultConfig.chunk.background }
					);
				}
			});
		},
		fillChunk: ({ size: { height, width }, position: { top, left } }, { color }) => {
			const ctx = this.#drawer.getContext();
			ctx.fillStyle = color;
			ctx.fillRect(left, top, width, height);
		},
	};

	readonly export: {
		imageFile: ExportImageFile;
		imageString: ExportImageString;
	} = {
		imageFile: async ({
			exportPath = path.resolve(__dirname, "images"),
			name = String(Date.now()),
			format = "png",
		}) => {
			await this.#drawer.redraw();
			const checkPath: (path: string) => boolean = (path) => fs.existsSync(path);
			if (!checkPath(exportPath)) fs.mkdirSync(exportPath);
			const out = fs.createWriteStream(path.join(exportPath, `${name}.${format}`));
			const stream = this.canvas.createPNGStream();
			stream.pipe(out);
			out.on("finish", () => console.log(`The ${name}.${format} file was created.`));
		},
		imageString: async () => {
			await this.#drawer.redraw();
			const bufferedImage = this.canvas.toBuffer("image/png");
			return Buffer.from(bufferedImage).toString("base64");
		},
	};
}
