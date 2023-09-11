import express from "express";
import { $contests, ContestObj, createContestFx } from "../services/contests";
import { io } from "../index";
import { SocketEvent } from "../socket/events";

export const contestRouter = express.Router();

export type ContestShortInfo = { id: string; img: Image };
export type ContestInfo = { id: string; img: Image; availablePositions: Position[]; size: Position };
export type Position = [x: number, y: number];
export type Image = string | null;

export const createImage: (img: string | null) => string | null = (img) =>
	img ? "data:image/png;base64, " + img : img;
export const createContestShortInfo: (contest: ContestObj) => Promise<ContestShortInfo> = async ({ id, contest }) => {
	const img = await contest.export.imageString();

	return {
		id,
		img: createImage(img),
	};
};
export const createContestInfo: (contest: ContestObj) => Promise<ContestInfo> = async ({ id, contest, status }) => {
	const img = await contest.export.imageString();
	const { height, width } = contest.defaultConfig.fieldsCount;

	return {
		id,
		img: createImage(img),
		availablePositions:
			contest.game.engine["regular"].isGameFinished() || status.finished
				? []
				: contest.game.chunk
						.getAllByCondition((chunk) => chunk.status.available && !chunk.status.checked)
						.map((chunk) => chunk.info.position),
		size: [width, height],
	};
};

contestRouter.get("", async (_, res) => {
	const list = $contests.getState().list;
	let contests: any[] = [];
	for (const contestObj of list) {
		const contest = await createContestShortInfo(contestObj);
		contests = [...contests, contest];
	}
	res.status(200).send(contests);
});
contestRouter.post("/create", async (req, res) => {

	const prizes = [
		{ id: 0, name: "7D", totalCount: 1 },
		{ id: 1, name: "5D", totalCount: 2 },
		{ id: 2, name: "3D", totalCount: 4 },
		{ id: 3, name: "1D", totalCount: 8 },
	];

	const config = {
		fieldSize: req.body.fieldSize || {
			height: 600,
			width: 900,
		},
		fieldsCount: req.body.fieldsCount || {
			height: 10,
			width: 16,
		}
	};

	const { id } = await createContestFx({ config, prizes });
	const responseData = { id };
	console.log(`Created contest id:${id}`);
	res.status(200).send(responseData);
	io.emit(SocketEvent.contestCreated, responseData);
});
contestRouter.get("/id/:id", async (req, res) => {
	const list = $contests.getState().list;
	const contest = list.find(({ id }) => req.params.id === id);
	if (!contest) return res.status(200).send(null);
	const contestInfo = await createContestInfo(contest);
	res.status(200).send(contestInfo);
});
contestRouter.get("/by-id/:id", async (req, res) => {
	const list = $contests.getState().list;
	const filteredList = list.filter(({ id }) => req.params.id === id);
	let contests: any[] = [];
	for (const contestObj of filteredList) {
		const contest = await createContestShortInfo(contestObj);
		contests = [...contests, contest];
	}
	res.status(200).send(contests);
});
