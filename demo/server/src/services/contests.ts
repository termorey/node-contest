import type { Config, PrizeBank } from "contest";
import { Contest, ContestEvent } from "contest";
import { v4 as uuid } from "uuid";
import { createApi, createEffect, createEvent, createStore, sample } from "effector";
import * as console from "console";

export interface ContestObj {
	id: string;
	contest: Contest;
	prizes: PrizeObj[];
	status: ContestStatus;
}
interface ContestStatus {
	finished: boolean;
}
interface PrizeObj {
	id: number;
	name: string;
	totalCount: number;
}

interface State {
	list: ContestObj[];
}

export const $contests = createStore<State>({ list: [] });
export const contestsApi = createApi($contests, {
	addContest: (state, contest: ContestObj) => ({ ...state, list: [...state.list, contest] }),
	changeContestStatus: (state, { contestId, status }: { contestId: string; status: Partial<ContestStatus> }) => ({
		...state,
		list: state.list.map((contest) =>
			contestId === contest.id ? { ...contest, status: { ...contest.status, ...status } } : contest
		),
	}),
});
const contestFinished = createEvent<string>();

export const createContestFx = createEffect(
	async ({ config, prizes }: { config: Omit<Config, "bank">; prizes: PrizeObj[] }) => {
		const id = uuid();
		const transformPrizes: (prizesList: PrizeObj[]) => PrizeBank = (prizes) => {
			return Object.values(prizes).map(({ id, totalCount }) => ({ info: { id }, count: totalCount }));
		};

		const contest = new Contest({
			config: {
				...config,
				bank: transformPrizes(prizes),
			},
		});

		contest.addEventListener(ContestEvent.finished, () => {
			console.log("finished", id, contest.game.engine["regular"].isGameFinished());
			console.log("stats", contest.game.bank.getStats());
			contestFinished(id);
		});

		const contestObj: ContestObj = {
			id,
			contest,
			prizes,
			status: {
				finished: false,
			},
		};

		return contestObj;
	}
);
export const finishContestFx = createEffect((contestId: string) => {
	return { contestId, status: { finished: true } };
});

sample({
	clock: createContestFx.doneData,
	target: contestsApi.addContest,
});

sample({
	clock: contestFinished,
	target: finishContestFx,
});

sample({
	clock: finishContestFx.doneData,
	target: contestsApi.changeContestStatus,
});
