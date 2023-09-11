import { createApi, createEffect, createStore } from "effector";
import { Step } from "contest";

type NextStep = { contestId: string; step: Step };

export const $stepsQueue = createStore<NextStep[]>([]);
const stepsQueueApi = createApi($stepsQueue, {
	addStep: (state, nextStep: NextStep) => [...state, nextStep],
	removeContestSteps: (state, contestId: string) => state.filter((step) => step.contestId !== contestId),
});

export const addContestStepFx = createEffect(stepsQueueApi.addStep);
export const clearContestStepsQueue = createEffect(stepsQueueApi.removeContestSteps);
