import { app } from "./app.js";
import { ENV } from "./config/env.js";

const PORT = ENV.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Staff Portal API running on port ${PORT}`);
});

