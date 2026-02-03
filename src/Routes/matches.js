import { Router } from "express";
import {createMatchSchema, listMatchesQuerySchema} from "../validation/matches.js";
import { getMatchStatus } from "../utils/match-status.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import {desc} from "drizzle-orm";

export const MatchesRouter = Router();
const MAX_LIMIT=100;
MatchesRouter.get("/", async (req, res) => {
 const parsed = listMatchesQuerySchema.safeParse(req.query);
 if (!parsed.success) {
   return res.status(400).json({ message: "Invalid Query Params", errors: parsed.error.errors });
 }
 const limit=Math.min(parsed.data.limit ?? 50 , MAX_LIMIT)
  try {
    const data = await db
        .select()
        .from(matches)
        .orderBy(desc(matches.createdAt))
        .limit(limit);
    res.status(200).json({data});
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed fetching match" });
  }
});

MatchesRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid Payload", errors: parsed.error.errors });
  }

  const { startTime, endTime, homeScore, awayScore } = parsed.data;

  try {
    const [event] = await db.insert(matches).values({
      ...parsed.data,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      homeScore: homeScore ?? 0,
      awayScore: awayScore ?? 0,
      status: getMatchStatus(startTime, endTime) ?? "scheduled"
    }).returning();

    res.status(201).json({data:event});
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
});