import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";

const limit = Number(process.argv[2] || 40);

function formatBytes(bytes) {
  const units = ["B", "KiB", "MiB", "GiB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

const trackedFiles = git(["ls-files", "-z"])
  .split("\0")
  .filter(Boolean)
  .map((file) => {
    try {
      return { file, size: statSync(file).size };
    } catch {
      return null;
    }
  })
  .filter(Boolean)
  .sort((a, b) => b.size - a.size);

console.log("Git object database:");
console.log(git(["count-objects", "-vH"]).trim());
console.log("");
console.log(`Largest tracked files (top ${limit}):`);

for (const item of trackedFiles.slice(0, limit)) {
  console.log(`${formatBytes(item.size).padStart(10)}  ${item.file}`);
}
