import { Hono } from "hono";
import { z } from "zod";
import { sValidator } from "@hono/standard-validator";
import { $contests, ContestObj, createContestFx } from "@/services/contests";
import { io } from "@/socket/socket.ts";
import { SocketEvent } from "@/socket/events";

export type ContestShortInfo = { id: string; img: Image };
export type ContestInfo = {
  id: string;
  img: Image;
  availablePositions: Position[];
  size: Position;
};
export type Position = [x: number, y: number];
export type Image = string | null;

export const createImage: (img: string | null) => string | null = (img) =>
  img ? "data:image/png;base64, " + img : img;
export const createContestShortInfo: (
  contest: ContestObj,
) => Promise<ContestShortInfo> = async ({ id, contest }) => {
  const img = await contest.export.imageString();

  return {
    id,
    img: createImage(img),
  };
};
export const createContestInfo: (
  contest: ContestObj,
) => Promise<ContestInfo> = async ({ id, contest, status }) => {
  const img = await contest.export.imageString();
  const { height, width } = contest.defaultConfig.fieldsCount;

  return {
    id,
    img: createImage(img),
    availablePositions:
      contest.game.engine["regular"].isGameFinished() || status.finished
        ? []
        : contest.game.chunk
            .getAllByCondition(
              (chunk) => chunk.status.available && !chunk.status.checked,
            )
            .map((chunk) => chunk.info.position),
    size: [width, height],
  };
};

export const contestRouter = new Hono()
  .get("/", async (ctx) => {
    const list = $contests.getState().list;
    let contests: any[] = [];
    for (const contestObj of list) {
      const contest = await createContestShortInfo(contestObj);
      contests = [...contests, contest];
    }
    return ctx.json(contests, 200);
  })
  .post(
    "/create",
    sValidator(
      "json",
      z.object({
        fieldSize: z
          .object({ height: z.number(), width: z.number() })
          .optional(),
        fieldsCount: z
          .object({ height: z.number(), width: z.number() })
          .optional(),
      }),
    ),
    async (ctx) => {
      const body = ctx.req.valid("json");

      const prizes = [
        { id: 0, name: "7D", totalCount: 1 },
        { id: 1, name: "5D", totalCount: 2 },
        { id: 2, name: "3D", totalCount: 4 },
        { id: 3, name: "1D", totalCount: 8 },
      ];

      const config = {
        fieldSize: body.fieldSize || {
          height: 600,
          width: 900,
        },
        fieldsCount: body.fieldsCount || {
          height: 10,
          width: 16,
        },
      };

      const { id } = await createContestFx({ config, prizes });
      const responseData = { id };
      console.log(`Created contest id:${id}`);
      io.emit(SocketEvent.contestCreated, responseData);
      return ctx.json(responseData, 200);
    },
  )
  .get(
    "/id/:id",
    sValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const params = ctx.req.valid("param");
      const list = $contests.getState().list;
      const contest = list.find(({ id }) => params.id === id);
      if (!contest) return ctx.json(null, 200);
      const contestInfo = await createContestInfo(contest);
      return ctx.json(contestInfo, 200);
    },
  )
  .get(
    "/by-id/:id",
    sValidator("param", z.object({ id: z.string() })),
    async (ctx) => {
      const params = ctx.req.valid("param");
      const list = $contests.getState().list;
      const filteredList = list.filter(({ id }) => params.id === id);
      let contests: any[] = [];
      for (const contestObj of filteredList) {
        const contest = await createContestShortInfo(contestObj);
        contests = [...contests, contest];
      }
      return ctx.json(contests, 200);
    },
  );
