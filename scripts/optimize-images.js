import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((dirent) => {
    const full = path.join(dir, dirent.name);
    return dirent.isDirectory() ? walk(full) : full;
  });
}

async function optimize() {
  const publicDir = path.join(__dirname, "..", "public");
  const files = walk(publicDir).filter((f) => f.endsWith(".png"));

  for (const file of files) {
    const temp = `${file}.tmp`;
    await sharp(file).png({ quality: 80, compressionLevel: 9 }).toFile(temp);
    fs.renameSync(temp, file);
    console.log("Optimized:", file);
  }
}

optimize().catch(console.error);
