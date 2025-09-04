import express from "express"
import bodyParser from "body-parser"
import router from "../server/routes/routes"

function fakeAuth(req:any, _res:any, next:any) {
    if(!req.user) req.user = { email: "test@example.com" };
    next();
}

export function createTestApp() {
    const app = express();
    app.use(bodyParser.json());

    app.use((req, res, next) => {
        if(
            req.path.startsWith('/api/v1/balance') ||
            req.path.startsWith('/api/v1/trade')
        ) {
            return fakeAuth(req, res, next);
        }
        next();
    })

    app.use("/api/v1", router);
    return app;
}