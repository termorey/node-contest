import { CanvasRenderingContext2D } from "canvas";
import type { Snapshot } from "./entities/snapshot";

export interface ContestInterface {
	defaultConfig: {
		backgroundColor: string;
		chunk: {
			background: string;
			checkedBackground: string;
		};
		frame: number;
		gap: number;
		fieldsCount: {
			height: number;
			width: number;
		};
	};

	config: Config;
	snapshots: Snapshot[];
}

interface ContestEventTarget extends EventTarget {
	addEventListener<K extends keyof ContestEventMap>(
		type: K,
		listener: (ev: ContestEventMap[K]) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	addEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
}
interface ContestEventMap {
	finished: CustomEvent<void>;
}
export type TypedEventTarget<Target extends EventTarget> = { new (): Target; prototype: Target };
export type TypedContestEventTarget = TypedEventTarget<ContestEventTarget>;

export interface ChunkInterface {
	checkPositionsEqual: (chunk_first: GameChunk, chunk_second: GameChunk) => boolean;
	createChunkInfo: (position: Position) => ChunkInfo;
	find: (position: Position) => GameChunk | null;
	generateField: (size: { height: number; width: number }) => ChunkInfo[];
	getFieldPosition: (position: Position) => FieldPosition;
	getFieldSize: () => Size;
	getPositions: (count: number, onlyFree?: boolean) => Position[];
}
export interface DrawInterface {
	getContext: () => CanvasRenderingContext2D;
	drawBackgroundImage: (link: string) => Promise<void>;
	redraw: () => Promise<void>;
	clearField: () => void;
	drawChunks: (chunks: GameChunk[]) => void;
	primitives: {
		drawLine: (
			data: { from: { x: number; y: number }; to: { x: number; y: number } },
			options: { color: string; width: number }
		) => void;
		drawArc: (
			data: { center: { x: number; y: number }; radius: number; length: number },
			options: { color: string; width: number; fill?: boolean }
		) => void;
	};
	drawXCross: (chunk: GameChunk, options: { color: string; width: number }) => void;
	drawCircle: (chunk: GameChunk, options: { color: string; width: number }) => void;
	fillChunk: (position: { size: Size; position: FieldPosition }, options: { color: string }) => void;
}
export type Next = (steps: Step[]) => { resolved: Step[]; rejected: Step[] };
export type ExportImageFile = (options: { exportPath?: string; name?: string; format?: string }) => Promise<void>;
export type ExportImageString = () => Promise<string | null>;
export interface SnapshotExport {
	imageFile: ExportImageFile;
	imageString: ExportImageString;
}

export interface Config {
	size: Size;
	bank: PrizeBank;
	backgroundColor?: string;
	backgroundImage?: string;
	onFinish?: () => void;
}

export interface SnapshotData {
	chunks: GameChunk[];
	lastSteps: Step[];
}

export interface Prize {
	id: number;
}

export type PrizeBank = { info: Prize; count: number }[];

export interface GameChunk {
	/** Текущий статус */
	status: ChunkStatus;
	/** информация о чанке */
	info: ChunkInfo;
	/** Содержащийся приз (показывается при вскрытии) */
	prize: null | Prize;
	/** Текущий ход игрока на чанке */
	step: null | Step;
}
export interface GameBank {
	info: Prize;
	positions: Position[];
	checkedSteps: Step[];
}

export interface GameSnapshot {
	gameChunks: GameChunk[];
}

export interface Step {
	/** Уникальный идентификатор (игрока или действия) */
	id: number;
	/** позиция на которую делается ход */
	position: Position;
}

export interface ChunkStatus {
	/** Вскрыт ли чанк */
	checked: boolean;
	/** Доступен ли для хода */
	available: boolean;
}
export interface ChunkInfo {
	/** Размер (координаты) */
	size: Size;
	/** Позиция среди чанков */
	position: Position;
	/** Позиция на поле (кординаты) */
	fieldPosition: FieldPosition;
}

type Size = { height: number; width: number };
export type Position = [x: number, y: number];
type FieldPosition = { top: number; left: number };
