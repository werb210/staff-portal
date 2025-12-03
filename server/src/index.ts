import "dotenv/config";
import app from "./app.js";

// IMPORTANT: no ".js" here so ts-node can resolve the TS file
import "./routes/index";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Staff Portal API listening on port ${PORT}`);
});
