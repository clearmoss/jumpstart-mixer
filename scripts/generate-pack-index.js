import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");
const packsSourceDir = path.join(publicDir, "packs");
const outputIndexFile = path.join(publicDir, "pack_index.json");

export function sortPackIndexEntries(entries, setMetadataByCode) {
  return Array.from(entries).toSorted((a, b) => {
    const codeA = a.url.split("/")[1];
    const codeB = b.url.split("/")[1];
    const metadataA = setMetadataByCode.get(codeA);
    const metadataB = setMetadataByCode.get(codeB);

    if (!metadataA || !metadataB) {
      throw new Error("Pack index entry is missing matching set metadata.");
    }

    return (
      metadataA.releaseDate.localeCompare(metadataB.releaseDate) ||
      metadataA.code.localeCompare(metadataB.code) ||
      a.url.localeCompare(b.url)
    );
  });
}

async function readSetMetadata() {
  let entries;
  try {
    entries = await fs.readdir(packsSourceDir, { withFileTypes: true });
  } catch (error) {
    throw new Error(`Could not read packs directory: ${packsSourceDir}`, { cause: error });
  }

  const setDirectories = entries.filter((entry) => entry.isDirectory());
  const metadataEntries = await Promise.all(
    setDirectories.map(async (directory) => {
      const code = directory.name;
      const metadataPath = path.join(packsSourceDir, code, "set.json");
      let metadata;
      try {
        const fileContent = await fs.readFile(metadataPath, "utf8");
        metadata = JSON.parse(String(fileContent));
      } catch (error) {
        throw new Error(`Could not read valid set metadata at ${metadataPath}.`, { cause: error });
      }

      const dateString = metadata.releaseDate;
      const validDate =
        typeof dateString === "string" &&
        /^\d{4}-\d{2}-\d{2}$/u.test(dateString) &&
        !Number.isNaN(Date.parse(`${dateString}T00:00:00.000Z`)) &&
        new Date(`${dateString}T00:00:00.000Z`).toISOString().slice(0, 10) === dateString;

      if (
        metadata.code !== code ||
        typeof metadata.name !== "string" ||
        metadata.name.trim() === "" ||
        !validDate
      ) {
        throw new Error(
          `Invalid set metadata at ${metadataPath}: expected code "${code}", a non-empty name, and a valid YYYY-MM-DD releaseDate.`
        );
      }

      return [code, metadata];
    })
  );

  return new Map(metadataEntries);
}

async function generatePackIndex() {
  // Use an object map temporarily to handle duplicate publicIds and then convert to array
  const tempIndexMap = {};
  const processedFilesCount = { success: 0, skipped: 0, errors: 0 };

  await fs.mkdir(path.dirname(outputIndexFile), { recursive: true });

  async function processFile(fullPath, relativeUrlPath) {
    try {
      const fileContent = (await fs.readFile(fullPath, "utf8")).toString();
      const parsedContent = JSON.parse(fileContent);

      if (parsedContent.meta && parsedContent.meta.publicId) {
        const publicId = parsedContent.meta.publicId;

        if (tempIndexMap[publicId]) {
          console.warn(
            `[WARN] Duplicate publicId '${publicId}' found. ` +
              `Overwriting path '${tempIndexMap[publicId].url}' with '${relativeUrlPath}'.`
          );
          processedFilesCount.skipped++;
        } else {
          processedFilesCount.success++;
        }
        tempIndexMap[publicId] = { publicId, url: relativeUrlPath };
      } else {
        console.warn(
          `[WARN] Skipping file '${relativeUrlPath}': 'publicId' not found in 'meta' object.`
        );
        processedFilesCount.skipped++;
      }
    } catch (parseError) {
      console.error(`[ERROR] Failed to process file '${relativeUrlPath}': ${parseError.message}`);
      processedFilesCount.errors++;
    }
  }

  async function readDirRecursive(currentPath) {
    let entries;
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT") {
        console.warn(`[WARN] Directory not found: ${currentPath}. Skipping this path.`);
        return;
      }
      throw error;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        // oxlint-disable-next-line no-await-in-loop
        await readDirRecursive(fullPath);
      } else if (
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".json") &&
        entry.name.toLowerCase() !== "set.json"
      ) {
        const relativeUrlPath = path.relative(publicDir, fullPath).replaceAll("\\", "/"); // Normalize for URLs

        // oxlint-disable-next-line no-await-in-loop
        await processFile(fullPath, relativeUrlPath);
      }
    }
  }

  console.log(`\n--- Starting MTGJSON Pack Index Generation ---`);
  console.log(`Scanning directory: ${packsSourceDir}`);

  const setMetadataByCode = await readSetMetadata();
  await readDirRecursive(packsSourceDir);

  const finalIndex = sortPackIndexEntries(Object.values(tempIndexMap), setMetadataByCode);
  const sets = [...new Set(finalIndex.map(({ url }) => url.split("/")[1]).filter(Boolean))];
  const packIndex = { sets, packs: finalIndex };

  await fs.writeFile(outputIndexFile, `${JSON.stringify(packIndex, null, 2)}\n`, "utf8");

  console.log(`\n--- Index Generation Complete ---`);
  console.log(`Output file: ${outputIndexFile}`);
  console.log(`Files successfully indexed: ${processedFilesCount.success}`);
  console.log(`Files skipped (missing publicId/duplicate): ${processedFilesCount.skipped}`);
  console.log(`Files with parsing errors: ${processedFilesCount.errors}`);
  console.log(`Total unique publicIds indexed: ${finalIndex.length}`);
  console.log(`Sets indexed: ${sets.length}`);
  console.log(`------------------------------------\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await generatePackIndex();
  } catch (err) {
    console.error("CRITICAL ERROR during index generation:", err);
    process.exit(1);
  }
}
