import "dotenv/config";
import app from "./app.js";

import "./routes/index.js";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Staff Portal API listening on port ${PORT}`);
});
