import express, { type Request, type Response } from "express"
import cors from "cors"
import allRoutes from "./routes/routes";
import cookieParser from "cookie-parser";
import { PORT } from "./config";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "hello" });
})

app.use("/api/v1", allRoutes)

app.use(cors())

app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})