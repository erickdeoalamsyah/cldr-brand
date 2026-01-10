import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const port = Number(env.PORT) || 4000;

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
