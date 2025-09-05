import express from "express"
import bodyParser from "body-parser"
import router from "../server/routes/routes"

export function createTestApp() {
    const app = express();
    app.use(bodyParser.json());

    app.use("/api/v1", router);
    return app;
}