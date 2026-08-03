import express from "express";
import * as analyticApp from "../application/analytics.js";

const analyticsRouter = express.Router();

analyticsRouter.get("/", async (req, res) => {
    try {
        const analytics = await analyticApp.getAnalytics();
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

analyticsRouter.get("/summary", async (req, res) => {
    try {
        const summary = await analyticApp.getSummary();
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

analyticsRouter.get("/:id", async (req, res) => {
    try {
        const analytic = await analyticApp.getAnalytic(req.params.id);
        res.json(analytic);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

analyticsRouter.post("/", async (req, res) => {
    try {
        const newAnalytic = await analyticApp.recordAnalytic(req.body);
        res.status(201).json(newAnalytic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

analyticsRouter.put("/:id", async (req, res) => {
    try {
        const updatedAnalytic = await analyticApp.updateAnalytic(req.params.id, req.body);
        res.json(updatedAnalytic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default analyticsRouter;