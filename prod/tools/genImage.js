const fs = require("fs");
const path = require("path");

const IMAGES_ROOT = path.join(__dirname, "..", "assets", "images");
const OUT_FILE = path.join(__dirname, "..", "images.json");
const exts = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function isImage(name) {
  return exts.has(path.extname(name).toLowerCase());
}

function main() {
  if (!fs.existsSync(IMAGES_ROOT)) {
    console.error("Missing images folder:", IMAGES_ROOT);
    process.exit(1);
  }

  const folders = fs.readdirSync(IMAGES_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const index = {};

  for (const folder of folders) {
    const folderPath = path.join(IMAGES_ROOT, folder);
    const files = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(d => d.isFile())
      .map(d => d.name)
      .filter(isImage)
      .sort()
      .map(name => `assets/images/${folder}/${name}`);

    if (files.length) index[folder] = files;
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(index, null, 2), "utf8");
  console.log(`Wrote ${Object.keys(index).length} folders to ${OUT_FILE}`);
}

main();