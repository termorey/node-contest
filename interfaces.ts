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
	getFieldSize: () => Size;
	getFieldPosition: (position: Position) => FieldPosition;
	createChunkInfo: (position: Position) => ChunkInfo;
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
export interface UtilsInterface {
	generateField: (size: { height: number; width: number }) => ChunkInfo[];
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

export interface Step {
	id: number;
	position: Position;
}

export interface Chunk {
	status: ChunkStatus;
	info: ChunkInfo;
}
interface ChunkStatus {
	checked: boolean;
}
export interface ChunkInfo {
	size: Size;
	position: Position;
	fieldPosition: FieldPosition;
}

type Size = { height: number; width: number };
type Position = [x: number, y: number];
type FieldPosition = { top: number; left: number };
