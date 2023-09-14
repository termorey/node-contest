import express from "express";
import { contestRouter } from "./contest";
import { stepsRouter } from "./steps";

export const router = express.Router();

router.use("/contests", contestRouter);
router.use("/steps", stepsRouter);
