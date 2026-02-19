import { execSync } from "node:child_process";

try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ Portal build successful");
  process.exit(0);
} catch (err) {
  console.error("❌ Portal build failed");
  process.exit(1);
}
