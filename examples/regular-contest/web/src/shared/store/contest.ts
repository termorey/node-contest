import {
  createApi,
  createEffect,
  createEvent,
  createStore,
  sample,
} from "effector";
import { Api, Config, ContestInfo, Position } from "shared/api/api.ts";
import { FormValues } from "../../widgets/contestCreation";

export const $contest = createStore<null | ContestInfo>(null);
const contestApi = createApi($contest, {
  setContest: (_, contest: null | ContestInfo) => contest,
});

export const createContestFx = createEffect(async (values: FormValues) => {
  const config: Config = {
    fieldSize: {
      height: values.fieldSizeY,
      width: values.fieldSizeX,
    },
    fieldsCount: {
      height: values.fieldsCountY,
      width: values.fieldsCountX,
    },
  };
  const result = await Api.contests.create({ payload: config });
  if (result.status === 200) return result.json();
  return null;
});
export const fetchContestInfoFx = createEffect(async (id: string) => {
  const result = await Api.contests.getById({ params: { contestId: id } });
  if (result.status === 200) return result.json();
  return null;
});
export const sendStepAndApplyFx = createEffect(
  async ({
    contestId,
    position,
  }: {
    contestId: string;
    position: Position;
  }) => {
    const result = await Api.steps.makeAndApply({
      payload: { contestId, position },
    });
    if (result.status === 200) return result.json();
    return null;
  },
);
export const sendStepToMakeFx = createEffect(
  async ({
    contestId,
    position,
  }: {
    contestId: string;
    position: Position;
  }) => {
    const result = await Api.steps.make({ payload: { contestId, position } });
    if (result.status === 200) return result.json();
    return null;
  },
);
export const applyStepsFx = createEffect(async (contestId: string) => {
  const result = await Api.steps.apply({ payload: { contestId } });
  if (result.status === 200) return result.json();
  return null;
});

sample({
  clock: fetchContestInfoFx.doneData,
  target: contestApi.setContest,
});

export const receivedContestInfo = createEvent<ContestInfo>();
sample({
  clock: receivedContestInfo,
  source: $contest,
  filter: (state, { id }) => state?.id === id,
  fn: (_, contest) => contest,
  target: contestApi.setContest,
});
