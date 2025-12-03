import app from "./app.js";
import "./config/env.js";

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Staff Portal API running on port ${PORT}`);
});
