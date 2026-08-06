import express from "express";
import * as departmentApp from "../application/department.js";
import Department from "../infrastructure/entities/Department.js";
import { requireRole } from "../middleware/auth.js";

const MANAGE_ROLES = ["supervisor", "manager", "admin"];
const departmentRouter = express.Router();

departmentRouter.use(express.json());

departmentRouter
  .route("/")
  .get(async (req, res, next) => {
    try {
      const departments = await departmentApp.getDepartments();
      res.json(departments);
    } catch (error) {
      next(error);
    }
  })
  .post(requireRole(...MANAGE_ROLES), async (req, res, next) => {
    try {
      const newDepartment = await departmentApp.addDepartment(req.body);
      res.status(201).json(newDepartment);
    } catch (error) {
      next(error);
    }
  });

departmentRouter.get("/stats", async (req, res, next) => {
  try {
    const stats = await departmentApp.getDepartmentStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

departmentRouter
  .route("/:id")
  .get(async (req, res, next) => {
    try {
      const department = await departmentApp.getDepartment(req.params.id);
      res.json(department);
    } catch (error) {
      next(error);
    }
  })
  .put(requireRole(...MANAGE_ROLES), async (req, res, next) => {
    try {
      const updated = await departmentApp.modifyDepartment(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  })
  .delete(requireRole(...MANAGE_ROLES), async (req, res, next) => {
    try {
      await departmentApp.removeDepartment(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

export default departmentRouter;