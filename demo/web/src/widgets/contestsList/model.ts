import { createEvent, sample } from "effector";
import { fetchContestsFx } from "shared/store/contests";

export const mounted = createEvent();

sample({
	clock: mounted,
	target: fetchContestsFx,
})