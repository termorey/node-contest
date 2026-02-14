import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Step } from "@termorey/node-contest";
import { $contests } from "@/services/contests";
import { io } from "@/socket/socket.ts";
import { SocketEvent } from "@/socket/events";
import { createContestInfo, createContestShortInfo } from "./contest";
import {
  $stepsQueue,
  addContestStepFx,
  clearContestStepsQueue,
} from "@/services/steps";

const createStepAnswer: <T extends boolean>(result: T) => { result: T } = (
  result,
) => ({ result });
const filterSteps: (steps: Step[]) => Step[] = (steps) =>
  steps.filter(({ id }, i, array) => {
    const firstIndex = array.findIndex((p) => p.id === id);
    return firstIndex >= 0 && firstIndex === i;
  });

export const stepsRouter = new Hono()
  .post(
    "/make",
    zValidator("json", z.custom<NextStep>().optional()),
    async (ctx) => {
      const body = ctx.req.valid("json");
      if (!body) return ctx.json(createStepAnswer(false), 200);
      await addContestStepFx(body);
      return ctx.json(createStepAnswer(true), 200);
    },
  )
  .post(
    "/apply",
    zValidator("json", z.object({ contestId: z.string() }).optional()),
    async (ctx) => {
      const body = ctx.req.valid("json");
      if (!body) return ctx.json(createStepAnswer(false), 200);
      const contestId = body.contestId;
      const contestsList = $contests.getState().list;
      const contest = contestsList.find(({ id }) => id === contestId);
      if (!contest) return ctx.json(createStepAnswer(false), 200);
      if (contest.status.finished)
        return ctx.json(createStepAnswer(false), 200);
      const stepsList = $stepsQueue.getState();
      const steps = stepsList
        .filter((step) => step.contestId === contestId)
        .map(({ step }) => step);
      // (!important) users duplicated steps must be filtered (one user = one step for one apply)
      const filteredSteps = filterSteps(steps);
      const { resolved, rejected: _rejected } =
        contest.contest.next(filteredSteps);
      await clearContestStepsQueue(contestId);
      const contestInfo = await createContestInfo(contest);
      const contestShortInfo = await createContestShortInfo(contest);
      io.emit(SocketEvent.contestSteps, contestInfo);
      io.emit(SocketEvent.contestUpdated, contestShortInfo);
      if (resolved.length > 0) return ctx.json(createStepAnswer(true), 200);
      return ctx.json(createStepAnswer(true), 200);
    },
  )
  .post(
    "/make-and-apply",
    zValidator("json", z.custom<NextStep>().optional()),
    async (ctx) => {
      const body = ctx.req.valid("json");
      if (!body) return ctx.json(createStepAnswer(false), 200);
      const contestsList = $contests.getState().list;
      const contest = contestsList.find(({ id }) => body.contestId === id);
      if (!contest) return ctx.json(createStepAnswer(false), 200);
      if (contest.status.finished)
        return ctx.json(createStepAnswer(false), 200);
      const { resolved, rejected: _rejected } = contest.contest.next([
        body.step,
      ]);
      const contestInfo = await createContestInfo(contest);
      const contestShortInfo = await createContestShortInfo(contest);
      io.emit(SocketEvent.contestSteps, contestInfo);
      io.emit(SocketEvent.contestUpdated, contestShortInfo);
      if (resolved.length > 0) return ctx.json(createStepAnswer(true), 200);
      return ctx.json(createStepAnswer(true), 200);
    },
  );

type NextStep = {
  contestId: string;
  step: { id: string; position: [x: number, y: number] };
};
