import type { Canvas } from "canvas";
import type { GameChunk, DrawInterface, SnapshotExport, Step } from "shared/interfaces";
import type { Contest } from "entities/contest";
import path from "path";
import fs from "fs";
import { createCanvas, Image } from "canvas";
import { SnapshotData } from "shared/interfaces";

export class Snapshot implements SnapshotData {
	_contest: Contest;
	canvas: Canvas;
	chunks: GameChunk[];
	lastSteps: Step[];

	constructor(_contest: Contest, chunks: GameChunk[], lastSteps: Step[]) {
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
			chunks.forEach((chunk) => {
				const {
					info: { size, fieldPosition },
					status,
					prize,
				} = chunk;

				if (status.checked) {
					this.#drawer.fillChunk(
						{ size, position: fieldPosition },
						{ color: this._contest.defaultConfig.chunk.checkedBackground }
					);
					if (!!prize) {
						this.#drawer.fillChunk({ size, position: fieldPosition }, { color: "rgb(255,255,0)" });
						this.#drawer.drawCircle(chunk, { color: "rgb(255,0,0)", width: 2 });
					} else {
						this.#drawer.drawXCross(chunk, { color: "rgb(255,0,0)", width: 2 });
					}
				} else {
					this.#drawer.fillChunk(
						{ size, position: fieldPosition },
						{ color: this._contest.defaultConfig.chunk.background }
					);
				}
			});
		},
		primitives: {
			drawLine: ({ from, to }, { color, width }) => {
				const ctx = this.#drawer.getContext();
				ctx.strokeStyle = color;
				ctx.lineWidth = width;
				ctx.moveTo(from.x, from.y);
				ctx.lineTo(to.x, to.y);
				ctx.closePath();
				ctx.stroke();
			},
			drawArc: ({ center: { x, y }, radius, length }, { color, width, fill }) => {
				const ctx = this.#drawer.getContext();
				ctx.strokeStyle = color;
				ctx.lineWidth = width;
				ctx.beginPath();
				ctx.arc(x, y, radius, 0, length);
				ctx.closePath();
				ctx.stroke();
				if (fill) ctx.fill();
			},
		},
		drawXCross: (
			{
				info: {
					size: { height, width },
					fieldPosition: { top, left },
				},
			},
			options
		) => {
			const center = { y: top + 0.5 * height, x: left + 0.5 * width };
			const length = height < width ? height : width;
			const toRad: (deg: number) => number = (deg) => (Math.PI / 180) * deg;
			const centerOffset = 0.5 * ((0.5 * length) / Math.acos(toRad(45)));

			this.#drawer.primitives.drawLine(
				{
					from: {
						x: center.x - centerOffset,
						y: center.y - centerOffset,
					},
					to: {
						x: center.x + centerOffset,
						y: center.y + centerOffset,
					},
				},
				options
			);
			this.#drawer.primitives.drawLine(
				{
					from: {
						x: center.x - centerOffset,
						y: center.y + centerOffset,
					},
					to: {
						x: center.x + centerOffset,
						y: center.y - centerOffset,
					},
				},
				options
			);
		},
		drawCircle: (
			{
				info: {
					size: { height, width },
					fieldPosition: { top, left },
				},
			},
			options
		) => {
			const center = { y: top + 0.5 * height, x: left + 0.5 * width };
			const diameter = height < width ? height : width;
			const radius = 0.8 * 0.5 * diameter;

			this.#drawer.primitives.drawArc(
				{
					center,
					radius,
					length: 2 * Math.PI,
				},
				options
			);
		},
		fillChunk: ({ size: { height, width }, position: { top, left } }, { color }) => {
			const ctx = this.#drawer.getContext();
			ctx.fillStyle = color;
			ctx.fillRect(left, top, width, height);
		},
	};

	readonly export: SnapshotExport = {
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
