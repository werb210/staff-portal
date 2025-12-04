import { createApp } from "./app.js";
import { ENV } from "./config/env.js";
import { log } from "./config/logger.js";

const app = createApp();

app.listen(ENV.PORT, () => {
  log.info(`Staff Portal Backend listening on port ${ENV.PORT}`);
});

