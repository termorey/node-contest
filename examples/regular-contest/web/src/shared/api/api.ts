import ky, { type ResponsePromise, type Options } from "ky";
import { $user } from "@/shared/store/user.ts";

const content = ky.create({
  prefix: "http://localhost:4000/api",
});

export const Api: {
  contests: {
    create: (config: {
      payload: Config;
      options?: Omit<Options, "body" | "json">;
    }) => ResponsePromise<ContestShortInfo | null>;
    getAll: (config: {
      options?: Options;
    }) => ResponsePromise<ContestShortInfo[]>;
    getAllById: (config: {
      params: {
        contestId: string;
      };
      options?: Options;
    }) => ResponsePromise<ContestShortInfo[]>;
    getById: (config: {
      params: {
        contestId: string;
      };
      options?: Options;
    }) => ResponsePromise<ContestInfo | null>;
  };
  steps: {
    make: (config: {
      payload: {
        contestId: string;
        position: Position;
      };
      options?: Omit<Options, "body" | "json">;
    }) => ResponsePromise<{ result: boolean }>;
    apply: (config: {
      payload: {
        contestId: string;
      };
      options?: Omit<Options, "body" | "json">;
    }) => ResponsePromise<{ result: boolean }>;
    makeAndApply: (config: {
      payload: {
        contestId: string;
        position: Position;
      };
      options?: Omit<Options, "body" | "json">;
    }) => ResponsePromise<{ result: boolean }>;
  };
} = {
  contests: {
    create: (config) =>
      content.post("contests/create", {
        ...config.options,
        json: config.payload,
      }),
    getAll: (config) => content.get("contests", config.options),
    getAllById: (config) =>
      content.get(`contests/by-id/${config.params.contestId}`, config.options),
    getById: (config) =>
      content.get(`contests/id/${config.params.contestId}`, config.options),
  },
  steps: {
    make: ({ payload: { contestId, position }, options }) =>
      content.post("steps/make", {
        ...options,
        json: {
          contestId,
          step: { id: $user.getState(), position },
        },
      }),
    apply: (config) =>
      content.post(`steps/apply`, { ...config.options, json: config.payload }),
    makeAndApply: ({ payload: { contestId, position }, options }) =>
      content.post(`steps/make-and-apply`, {
        ...options,
        json: {
          contestId,
          step: { id: $user.getState(), position },
        },
      }),
  },
};

export type ContestShortInfo = { id: string; img: null | string };
export type ContestInfo = {
  id: string;
  img: null | string;
  availablePositions: Position[];
};
export type Position = [x: number, y: number];
export type Config = {
  fieldSize: Size;
  fieldsCount: Size;
};
interface Size {
  height: number;
  width: number;
}
