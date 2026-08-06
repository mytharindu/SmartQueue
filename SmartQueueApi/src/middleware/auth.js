import { getUserByToken } from "../application/auth.js";

const getToken = (req) => req.headers.authorization?.replace(/^Bearer\s+/i, "");

export const requireRole = (...roles) => async (req, res, next) => {
    const user = await getUserByToken(getToken(req));
    if (!user) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    if (!roles.includes(user.role)) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
    }
    req.user = user;
    next();
};
