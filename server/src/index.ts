import express from "express";
import routes from "./routes/index";

const app = express();
app.use(express.json());

app.use("/api", routes);

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
    console.log(`Staff Portal API listening on port ${PORT}`);
});

export default app;
