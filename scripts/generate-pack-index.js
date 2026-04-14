import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");
const packsSourceDir = path.join(publicDir, "packs");
const outputIndexFile = path.join(publicDir, "pack_index.json");

async function generatePackIndex() {
  // Use an object map temporarily to handle duplicate publicIds and then convert to array
  const tempIndexMap = {};
  const processedFilesCount = { success: 0, skipped: 0, errors: 0 };

  await fs.mkdir(path.dirname(outputIndexFile), { recursive: true });

  async function readDirRecursive(currentPath) {
    let entries;
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") {
        console.warn(
          `[WARN] Directory not found: ${currentPath}. Skipping this path.`,
        );
        return;
      }
      throw error;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await readDirRecursive(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
        const relativeUrlPath = path
          .relative(publicDir, fullPath)
          .replace(/\\/g, "/"); // Normalize for URLs

        try {
          const fileContent = (await fs.readFile(fullPath, "utf8")).toString();
          const parsedContent = JSON.parse(fileContent);

          if (parsedContent.meta && parsedContent.meta.publicId) {
            const publicId = parsedContent.meta.publicId;

            if (tempIndexMap[publicId]) {
              console.warn(
                `[WARN] Duplicate publicId '${publicId}' found. ` +
                  `Overwriting path '${tempIndexMap[publicId].url}' with '${relativeUrlPath}'.`,
              );
              processedFilesCount.skipped++;
            } else {
              processedFilesCount.success++;
            }
            tempIndexMap[publicId] = { publicId, url: relativeUrlPath };
          } else {
            console.warn(
              `[WARN] Skipping file '${relativeUrlPath}': 'publicId' not found in 'meta' object.`,
            );
            processedFilesCount.skipped++;
          }
        } catch (parseError) {
          console.error(
            `[ERROR] Failed to process file '${relativeUrlPath}': ${parseError.message}`,
          );
          processedFilesCount.errors++;
        }
      }
    }
  }

  console.log(`\n--- Starting MTGJSON Pack Index Generation ---`);
  console.log(`Scanning directory: ${packsSourceDir}`);

  await readDirRecursive(packsSourceDir);

  const finalIndex = Object.values(tempIndexMap);

  const releaseOrder = {
    JMP: 1,
    J22: 2,
    J25: 3,
  };

  finalIndex.sort((a, b) => {
    // extract set code
    const setA = a.url.split("/")[1];
    const setB = b.url.split("/")[1];

    const orderA = releaseOrder[setA] || Infinity;
    const orderB = releaseOrder[setB] || Infinity;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // alphabetical fallback if unknown sets
    return a.url.localeCompare(b.url);
  });

  await fs.writeFile(
    outputIndexFile,
    JSON.stringify(finalIndex, null, 2),
    "utf8",
  );

  console.log(`\n--- Index Generation Complete ---`);
  console.log(`Output file: ${outputIndexFile}`);
  console.log(`Files successfully indexed: ${processedFilesCount.success}`);
  console.log(
    `Files skipped (missing publicId/duplicate): ${processedFilesCount.skipped}`,
  );
  console.log(`Files with parsing errors: ${processedFilesCount.errors}`);
  console.log(`Total unique publicIds indexed: ${finalIndex.length}`);
  console.log(`------------------------------------\n`);
}

generatePackIndex().catch((err) => {
  console.error("CRITICAL ERROR during index generation:", err);
  process.exit(1);
});
