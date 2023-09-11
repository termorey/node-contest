import { createApi, createEffect, createEvent, createStore, sample } from "effector";
import { Api, ContestShortInfo } from "shared/api/api.ts";
import { socket, SocketEvent } from "shared/socket";

export const $contests = createStore<ContestShortInfo[]>([]);
const contestsApi = createApi($contests, {
	setContests: (_, contests: ContestShortInfo[]) => (contests),
	addContests: (state, contests: ContestShortInfo[]) => ([...state, ...contests]),
	updateContest: (state, contest: ContestShortInfo) => state.map((stateContest) => stateContest.id === contest.id ? ({ ...stateContest, ...contest }) : stateContest),
});

const contestUpdated = createEvent<ContestShortInfo>();
export const fetchContestsFx = createEffect(async () => {
	const result = await Api.contests.getAll();
	if (result.status === 200) return result.data;
	return [];
});
export const fetchContestFx = createEffect(async (id: string) => {
	const result = await Api.contests.getAllById(id);
	if (result.status === 200) return result.data;
	return [];
});

socket.on(SocketEvent.contestCreated, ({ id }) => {
	fetchContestFx(id).finally();
});
socket.on(SocketEvent.contestUpdated, (contest) => {
	contestUpdated(contest);
});

sample({
	clock: fetchContestsFx.doneData,
	target: contestsApi.setContests,
});
sample({
	clock: fetchContestFx.doneData,
	target: contestsApi.addContests,
});
sample({
	clock: contestUpdated,
	target: contestsApi.updateContest,
});