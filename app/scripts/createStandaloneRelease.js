#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const fsPromises = fs.promises;

// List of file names to include when copying files.
// If empty, then all files are copied.
const INCLUDE_FILES = [
  "_next",
  "networks",
  "favicon.ico",
  "index.html",
  "OZ-Logo-Black.svg",
  "OZ-Logo-White.svg",
];

const srcDir = path.resolve(__dirname, "../out");
const destDir = path.resolve(__dirname, "../standalone");

async function copyDirectoryRecursively(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory "${src}" does not exist.`);
    process.exit(1);
  }

  if (fs.existsSync(dest)) {
    console.log(`Destination directory "${dest}" already exists. Deleting...`);
    await fsPromises.rm(dest, { recursive: true });
  }

  await fsPromises.mkdir(dest, { recursive: true });

  const entries = await fsPromises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (INCLUDE_FILES.length > 0) {
      if (entry.isDirectory()) {
        if (INCLUDE_FILES.includes(entry.name)) {
          await new Promise((resolve, reject) => {
            fs.cp(srcPath, destPath, { recursive: true }, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        } else {
          continue;
        }
      } else if (entry.isFile()) {
        if (!INCLUDE_FILES.includes(entry.name)) continue;

        await fsPromises.copyFile(srcPath, destPath);
      }
    } else {
      if (entry.isDirectory()) {
        await copyDirectoryRecursively(srcPath, destPath);
      } else if (entry.isFile()) {
        await fsPromises.copyFile(srcPath, destPath);
      }
    }
  }
}

function fixAssetPathsInHtml(htmlContent) {
  htmlContent = htmlContent.replace(/(=["'])\/(?!\/)/g, "$1./");
  htmlContent = htmlContent.replace(/(\\["'])\/(?!\/)/g, "$1./");
  return htmlContent;
}

function removeHowItWorksAnchor(htmlContent) {
  return htmlContent.replace(
    /<a[^>]*href=["']\/how-it-works["'][^>]*>.*?<\/a>/gi,
    ""
  );
}

/**
 * createStandaloneRelease performs the following post-build operations:
 *  1. Copies the out folder (located at app/out) to a standalone folder (../standalone)
 *     using the INCLUDE_FILES allow-list (if provided).
 *  2. Renames index.html (in the standalone folder root) to standalone.html.
 *  3. Reads standalone.html, fixes asset paths (both in attributes and within script content),
 *     and removes any anchor linking to "/how-it-works".
 *  4. Writes the modified HTML back to standalone.html.
 */
async function createStandaloneRelease() {
  try {
    console.log(`Copying folder "${srcDir}" to "${destDir}"...`);
    await copyDirectoryRecursively(srcDir, destDir);
    console.log("Folder copy complete.");

    const indexPath = path.join(destDir, "index.html");

    let htmlContent = await fsPromises.readFile(indexPath, "utf8");

    htmlContent = removeHowItWorksAnchor(htmlContent);
    htmlContent = fixAssetPathsInHtml(htmlContent);

    await fsPromises.writeFile(indexPath, htmlContent, "utf8");
    console.log(
      `Post-build processing complete. Modified HTML written to "${indexPath}".`
    );
  } catch (err) {
    console.error("An error occurred during post-build processing:", err);
    process.exit(1);
  }
}

createStandaloneRelease();
