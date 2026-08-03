import express from "express";
import * as serviceApp from "../application/service.js";
import Service from "../infrastructure/entities/Service.js";

const serviceRouter = express.Router();

serviceRouter.use(express.json());

serviceRouter
    .route("/")
    .get(async (req, res) => {
        try {
            const services = await serviceApp.getAllServices();
            res.json(services);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    })
    .post(async (req, res) => {
        try {
            const newService = await serviceApp.addService(req.body);
            res.status(201).json(newService);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });


serviceRouter
    .route("/:id")
    .get(async (req, res) => {
        try {
            console.log(req.params.id);
            const service = await serviceApp.getServiceById(req.params.id);
            console.log(service);
            res.json(service);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    })
    .put(async (req, res) => {
        try {
            const updatedService = await serviceApp.modifyService(req.params.id, req.body);
            res.json(updatedService);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    })
    .delete(async (req, res) => {
        try {
            const deletedService = await serviceApp.removeService(req.params.id);
            res.json(deletedService);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

export default serviceRouter;
