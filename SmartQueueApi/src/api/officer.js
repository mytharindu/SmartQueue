import express from "express";
import * as officerApp from "../application/officer.js";
import Officer from "../infrastructure/entities/Officer.js";

const officerRouter = express.Router();

officerRouter.use(express.json());


officerRouter
    .route("/")
    .get(async (req, res) => {
        try {
            const officers = await officerApp.getOfficers();
            res.json(officers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
    .post(async (req, res) => {
        try {
            const newOfficer = await officerApp.addOfficer(req.body);
            res.status(201).json(newOfficer);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

officerRouter
    .route("/:id")
    .get(async (req, res) => {
        try {
            const officer = await officerApp.getOfficer(req.params.id);
            res.json(officer);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    })
    .put(async (req, res) => {
        try {
            const updatedOfficer = await officerApp.modifyOfficer(req.params.id, req.body);
            res.json(updatedOfficer);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    })
    .delete(async (req, res) => {
        try {
            const deletedOfficer = await officerApp.removeOfficer(req.params.id);
            res.json(deletedOfficer);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });


officerRouter
    .route("/department/:department")
    .get(async (req, res) => {
        try {
            const officers = await officerApp.getOfficerByDept(req.params.department);
            res.json(officers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });


export default officerRouter;