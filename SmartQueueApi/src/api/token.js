import express from "express";
import * as tokenApp from "../application/token.js";
import Token from "../infrastructure/entities/Token.js";

const tokenRouter = express.Router();
tokenRouter.use(express.json());

tokenRouter
    .route("/")
    .get(async (req, res) => {
        try {
            const tokens = await tokenApp.getTokens();
            res.json(tokens);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
    .post(async (req, res) => {
        try {
            const newToken = await tokenApp.reserveToken(req.body);
            res.status(201).json(newToken);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

tokenRouter
    .route("/:id")
    .get(async (req, res) => {
        try {
            const token = await tokenApp.getToken(req.params.id);
            res.json(token);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    })
    .put(async (req, res) => {
        try {
            const updatedToken = await tokenApp.modifyToken(req.params.id, req.body);
            res.json(updatedToken);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

tokenRouter
    .route("/:id/call")
    .put(async (req, res) => {
        try {
            const updatedToken = await tokenApp.callToken(req.params.id, req.body.counterNumber);
            res.json(updatedToken);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

tokenRouter
    .route("/:id/complete")
    .put(async (req, res) => {
        try {
            const updatedToken = await tokenApp.completeToken(req.params.id);
            res.json(updatedToken);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

tokenRouter
    .route("/:id/cancel")
    .put(async (req, res) => {
        try {
            const updatedToken = await tokenApp.cancelToken(req.params.id);
            res.json(updatedToken);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

tokenRouter
    .route("/:id/priority")
    .put(async (req, res) => {
        try {
            const updatedToken = await tokenApp.reviewPriority(req.params.id, req.body.status);
            res.json(updatedToken);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

tokenRouter
    .route("/status/:status")
    .get(async (req, res) => {
        try {
            const tokens = await tokenApp.getTokensByStatus(req.params.status);
            res.json(tokens);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

export default tokenRouter;