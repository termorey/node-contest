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
export interface ChunkInterface {
	checkPositionsEqual: (chunk_first: Chunk, chunk_second: Chunk) => boolean;
	createChunkInfo: (position: Position) => ChunkInfo;
	find: (position: Position) => GameChunk | null;
	generateField: (size: { height: number; width: number }) => ChunkInfo[];
	getFieldPosition: (position: Position) => FieldPosition;
	getFieldSize: () => Size;
	getPositions: (count: number, onlyFree?: boolean) => Position[];
}
export interface SnapshotInterface {
	create: (data: { steps: Step[] }) => Snapshot | null;
}
export interface DrawInterface {
	getContext: () => CanvasRenderingContext2D;
	drawBackgroundImage: (link: string) => Promise<void>;
	redraw: () => Promise<void>;
	clearField: () => void;
	drawChunks: (chunks: Chunk[]) => void;
	fillChunk: (position: { size: Size; position: FieldPosition }, options: { color: string }) => void;
}
export type Create = () => void;
export type Next = (steps: Step[]) => { resolved: Step[]; rejected: Step[] };
export type ExportImageFile = (options: { exportPath?: string; name?: string; format?: string }) => Promise<void>;
export type ExportImageString = () => Promise<string | null>;

export interface Config {
	size: Size;
	backgroundColor?: string;
	backgroundImage?: string;
}

export interface SnapshotData {
	chunks: Chunk[];
	lastSteps: Step[];
}

export interface Prize {
	id: number;
}

export type PrizeBank = { info: Prize; count: number }[];

export interface GameChunk extends Chunk {
	prize: null | Prize;
	step: null | Step;
}
export interface GameBank {
	info: Prize;
	positions: Position[];
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

export interface Chunk {
	status: ChunkStatus;
	info: ChunkInfo;
}
interface ChunkStatus {
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
