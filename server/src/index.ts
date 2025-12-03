import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    console.log("Starting Staff-Portal backend...");

    app.listen(PORT, () => {
      console.log(`Staff-Portal API running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
}

start();
