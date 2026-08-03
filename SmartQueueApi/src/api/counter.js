import express from "express";
import * as counterApp from "../application/counter.js";
import Counter from "../infrastructure/entities/Counter.js";


const counterRouter = express.Router();

counterRouter.use(express.json());

counterRouter
  .route("/")
  .get(async (req, res, next) => {
    try {
      const counters = await counterApp.getCounters();
      res.json(counters);
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const newCounter = await counterApp.addCounter(req.body);
      res.status(201).json(newCounter);
    } catch (error) {
      next(error);
    }
  });

counterRouter
  .route("/:id")
  .get(async (req, res, next) => {
    try {
      const counter = await counterApp.getCounter(req.params.id);
      if (!counter) {
        res.status(404).json({ error: "Counter not found" });
      } else {
        res.json(counter);
      }
    } catch (error) {
      next(error);
    }
  })
  .put(async (req, res, next) => {
    try {
      const updatedCounter = await counterApp.modifyCounter(req.params.id, req.body);
      if (!updatedCounter) {
        res.status(404).json({ error: "Counter not found" });
      } else {
        res.json(updatedCounter);
      }
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const deletedCounter = await counterApp.removeCounter(req.params.id);
      if (!deletedCounter) {
        res.status(404).json({ error: "Counter not found" });
      } else {
        res.json(deletedCounter);
      }
    } catch (error) { 
      next(error);
    }
  });

export default counterRouter;
