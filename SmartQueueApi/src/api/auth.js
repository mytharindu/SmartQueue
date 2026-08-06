import express from "express";
import * as authApp from "../application/auth.js";
import { requireRole } from "../middleware/auth.js";

const authRouter = express.Router();

const getToken = (req) => req.headers.authorization?.replace(/^Bearer\s+/i, "");

const requireAdmin = requireRole("admin");

authRouter.post("/register", async (req, res) => {
    try {
        const user = await authApp.register(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const result = await authApp.login(req.body);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

authRouter.post("/logout", async (req, res) => {
    try {
        await authApp.logout(getToken(req));
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

authRouter.get("/me", async (req, res) => {
    try {
        const user = await authApp.getUserByToken(getToken(req));
        if (!user) {
            res.status(401).json({ error: "Not authenticated" });
            return;
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

authRouter.get("/users", requireAdmin, async (req, res) => {
    try {
        const users = await authApp.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

authRouter.put("/users/:id/role", requireAdmin, async (req, res) => {
    try {
        const user = await authApp.updateUserRole(req.params.id, req.body.role);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default authRouter;
