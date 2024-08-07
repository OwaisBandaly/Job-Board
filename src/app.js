import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import jobListingRouter from "./routes/jobListing.routes.js";
import companyRouter from "./routes/company.routes.js";
import applicationRouter from "./routes/application.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/jobs", jobListingRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/application", applicationRouter);

export default app;
