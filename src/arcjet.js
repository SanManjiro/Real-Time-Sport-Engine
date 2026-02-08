import arcjet, {detectBot, shield, slidingWindow} from "@arcjet/node";
import * as http from "node:http";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJET_ENV === "DRY_RUN" ? "DRY_RUN" : "LIVE";
if (!arcjetKey) throw new Error("Arcjet key missing");

export const httpArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW", "CURL"]
        }),
        slidingWindow({ mode: arcjetMode, interval: "2s", max: 50 }),
      ],
    })
  : null;

export const wsArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
          //Protection contre les tentatives d'injection sql, XSS, et autres attaques
        shield({ mode: arcjetMode }),
          //Detection de bots : detecte si c'est un humain ou un robot et autorise uniquement les robots des moteurs de recherche
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
          //Rate limiting
        slidingWindow({ mode: arcjetMode, interval: "10s", max: 5 }),
      ],
    })
  : null;

export function securityMiddleware(){
    return async (req, res, next)=>{
        if(!httpArcjet) return next();
        try{
            const decision= await httpArcjet.protect(req);
            if(decision.isDenied()){
                if(decision.reason.isRateLimit()){
                    return res.status(429).json({error: "Too many requests"})
                }
                return res.status(403).json({error: "Access Forbidden"})
            }
        }catch(e){
            console.error('Arcjet middleware error',e);
            return res.status(503).json({error:"Service Unavailable"})
        }
        next()
    }
}