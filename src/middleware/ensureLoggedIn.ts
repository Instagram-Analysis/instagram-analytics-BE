// backend/src/middleware/ensureLoggedIn.ts
import { Request, Response, NextFunction } from "express";

export default function ensureLoggedIn(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.session?.igUsername || !req.session?.igPassword) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}
