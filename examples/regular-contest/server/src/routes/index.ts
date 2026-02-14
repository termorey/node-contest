import { Hono } from "hono";
import { contestRouter } from "./contest";
import { stepsRouter } from "./steps";

export const routes = new Hono()
  .route("/contests", contestRouter)
  .route("/steps", stepsRouter);
