import "dotenv/config";
import express from "express";
import dns from "dns";
import connectDB from "./infrastructure/db.js";
import serviceRouter from "./api/service.js";
import officerRouter from "./api/officer.js";
import analyticsRouter from "./api/analytics.js";
import departmentRouter from "./api/department.js";
import counterRouter from "./api/counter.js";
import tokenRouter from "./api/token.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
console.log("DNS Servers:", dns.getServers());

const app = express();

app.use(express.json());

app.use("/api/services", serviceRouter);
app.use("/api/officers", officerRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/counters", counterRouter);
app.use("/api/tokens", tokenRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: error.message });
});

connectDB();

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} test`);
});