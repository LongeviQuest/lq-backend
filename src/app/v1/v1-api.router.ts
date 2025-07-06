import express = require("express");
import { queries } from "./queries/queries.router";
import { humans } from "./humans/humans.router";

const router = express.Router();

router.use("/queries", queries);
router.use("/humans", humans);

export const v1Router = router;
