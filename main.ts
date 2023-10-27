import cors from "cors";
import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import auth from "./router/authRouter";

const main = (app: Application) => {
  app.use(express.json());
  app.use(cors());
  app.set("view engine", "ejs");
  app.use(helmet());

  app.get("/", (req: Request, res: Response) => {
    try {
      return res.status(200).json({
        message: "welcome to my api",
      });
    } catch (error: any) {
      return res.status(404).json({
        message: "error",
        data: error.message,
      });
    }
  });

  app.use("/api", auth);
};

export default main;
