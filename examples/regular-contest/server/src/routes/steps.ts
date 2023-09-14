import type { Step } from "@termorey/node-contest";
import express from "express";
import { $contests } from "../services/contests";
import { io } from "../index";
import { SocketEvent } from "../socket/events";
import { createContestInfo, createContestShortInfo } from "./contest";
import { $stepsQueue, addContestStepFx, clearContestStepsQueue } from "../services/steps";

export const stepsRouter = express.Router();

const createStepAnswer: <T extends boolean>(result: T) => { result: T } = (result) => ({ result });
const filterSteps: (steps: Step[]) => Step[] = (steps) =>
	steps.filter(({ id }, i, array) => {
		const firstIndex = array.findIndex((p) => p.id === id);
		return firstIndex >= 0 && firstIndex === i;
	});

stepsRouter.post("/make", async (req, res) => {
	if (!req.body) return res.status(200).send(createStepAnswer(false));
	const body = req.body as NextStep;
	await addContestStepFx(body);
	return res.status(200).send(createStepAnswer(true));
});
stepsRouter.post("/apply", async (req, res) => {
	if (!req.body) return res.status(200).send(createStepAnswer(false));
	const body = req.body as { contestId: string };
	const contestId = body.contestId;
	const contestsList = $contests.getState().list;
	const contest = contestsList.find(({ id }) => id === contestId);
	if (!contest) return res.status(200).send(createStepAnswer(false));
	if (contest.status.finished) return res.status(200).send(createStepAnswer(false));
	const stepsList = $stepsQueue.getState();
	const steps = stepsList.filter((step) => step.contestId === contestId).map(({ step }) => step);
	// (!important) users duplicated steps must be filtered (one user = one step for one apply)
	const filteredSteps = filterSteps(steps);
	const { resolved, rejected } = contest.contest.next(filteredSteps);
	await clearContestStepsQueue(contestId);
	const contestInfo = await createContestInfo(contest);
	const contestShortInfo = await createContestShortInfo(contest);
	io.emit(SocketEvent.contestSteps, contestInfo);
	io.emit(SocketEvent.contestUpdated, contestShortInfo);
	if (resolved.length > 0) return res.status(200).send(createStepAnswer(true));
	return res.status(200).send(createStepAnswer(true));
});
stepsRouter.post("/make-and-apply", async (req, res) => {
	if (!req.body) return res.status(200).send(createStepAnswer(false));
	const body = req.body as NextStep;
	const contestsList = $contests.getState().list;
	const contest = contestsList.find(({ id }) => body.contestId === id);
	if (!contest) return res.status(200).send(createStepAnswer(false));
	if (contest.status.finished) return res.status(200).send(createStepAnswer(false));
	const { resolved, rejected } = contest.contest.next([body.step]);
	const contestInfo = await createContestInfo(contest);
	const contestShortInfo = await createContestShortInfo(contest);
	io.emit(SocketEvent.contestSteps, contestInfo);
	io.emit(SocketEvent.contestUpdated, contestShortInfo);
	if (resolved.length > 0) return res.status(200).send(createStepAnswer(true));
	return res.status(200).send(createStepAnswer(true));
});

type NextStep = { contestId: string; step: { id: string; position: [x: number, y: number] } };
