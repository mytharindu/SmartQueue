import express from "express";
import * as timeslotApp from "../application/timeslot.js";

const timeslotRouter = express.Router();

timeslotRouter.get("/", async (req, res) => {
    try {
        const { serviceId, date } = req.query;
        if (!serviceId) {
            res.status(400).json({ error: "serviceId is required" });
            return;
        }
        const slots = await timeslotApp.getServiceSlots(serviceId, date);
        res.json(slots);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default timeslotRouter;
