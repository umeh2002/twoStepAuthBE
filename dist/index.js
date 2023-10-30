"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./Config/db"));
const main_1 = __importDefault(require("./main"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const realPort = parseInt(process.env.PORT);
const port = realPort;
const app = (0, express_1.default)();
(0, main_1.default)(app);
const server = app.listen(process.env.PORT || port, () => {
    (0, db_1.default)();
    console.log(`server is running on port ${port}`);
});
process.on("uncaughtException", (error) => {
    console.log("server is shutting down due to uncaught exception");
    console.log(error);
});
process.on("unhandledRejection", (reason) => {
    console.log("server is shutting down due to unhandled rejection");
    console.log(reason);
    server.close(() => {
        process.exit(1);
    });
});
