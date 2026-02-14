import { createEvent, sample } from "effector";
import { fetchContestsFx } from "shared/store/contests/contests.ts";

export const mounted = createEvent();

sample({
  clock: mounted,
  target: fetchContestsFx,
});
