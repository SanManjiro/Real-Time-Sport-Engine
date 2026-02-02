import {Router} from "express";

export const MatchesRouter = Router();
MatchesRouter.get("/MatchesList", (req, res) =>{
    res.status(200).json({message: "Matches List"});
});