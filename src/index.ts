import { parseArgs } from "node:util";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { FileProjectAdapter } from "./adapters";
import { Parser } from "./parser";
import { Unparser } from "./unparser";
import { FileSystemOutput } from "./adapters/FileSystemOutput";
import { transformers } from "./transformations";
import { isSourceLine } from "./utils/ast";

const args = parseArgs({
  allowPositionals: true,
  options: {
    extensions: {
      type: "string",
      short: "e",
      default: "asm,inc",
    },
    map: {
      type: "string",
    },
    "inline-map": {
      type: "string",
      multiple: true,
      short: "m",
    },
    replacements: {
      type: "string",
    },
    define: {
      type: "string",
      short: "d",
      multiple: true,
    },
    "defines-file-name": {
      type: "string",
      default: "defines.inc",
    },
  },
});

const registerMap = new Map<string, string>();
const replacementMap = new Map<string, string>();
const defines = new Map<string, string>();

async function main() {
  const [inputDir, outputDir] = args.positionals;
  const fileExtensions = args.values.extensions
    .split(",")
    .map((e) => e.trim())
    .filter((e) => Boolean);

  if (!inputDir || !existsSync(inputDir)) {
    console.error("Please provide a valid input directory.");
    process.exit(1);
  }

  if (!outputDir) {
    console.error("Please provide a valid output directory.");
    process.exit(1);
  }

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputFiles = new FileSystemOutput(outputDir);

  const inputFiles = new FileProjectAdapter(inputDir);
  const allFiles = await inputFiles.getAllFiles();

  if (args.values.map) {
    const mapFile = args.values.map;
    if (!existsSync(mapFile)) {
      console.error(`Map file "${mapFile}" does not exist.`);
      process.exit(1);
    }

    const mapContent = readFileSync(mapFile, "utf-8");
    mapContent.split("\n").forEach((line) => {
      const parts = line.split("=");
      if (parts.length === 2) {
        const oldName = parts[0].trim();
        const newName = parts[1].trim();
        registerMap.set(oldName.toLowerCase(), newName);
      }
    });
  }

  if (args.values["inline-map"]) {
    args.values["inline-map"].forEach((keyVal) => {
      const parts = keyVal.split("=");
      if (parts.length === 2) {
        const oldName = parts[0].trim();
        const newName = parts[1].trim();
        registerMap.set(oldName.toLowerCase(), newName);
      }
    });
  }

  if (args.values.define) {
    args.values.define.forEach((define) => {
      const parts = define.split("=");
      if (parts.length === 2) {
        const oldName = parts[0].trim();
        const newName = parts[1].trim();
        defines.set(oldName, newName);
      }
    });
  }

  if (args.values.replacements) {
    const mapFile = args.values.replacements;
    if (!existsSync(mapFile)) {
      console.error(`Replacement map file "${mapFile}" does not exist.`);
      process.exit(1);
    }

    const mapContent = readFileSync(mapFile, "utf-8");
    mapContent.split("\n").forEach((line) => {
      const parts = line.split("=");
      if (parts.length === 2) {
        const oldName = parts[0].trim();
        const newName = parts[1].trim();
        replacementMap.set(oldName, newName);
      }
    });
  }

  const parser = new Parser();

  // parse each file
  await Promise.all(
    allFiles
      .filter((file) =>
        fileExtensions.some((ext) => file.name.endsWith(`.${ext}`))
      )
      .map((file) => {
        return inputFiles.transform(file.id, {}, async (file) => {
          file.program = parser.parseFile(file.content);
        });
      })
  );

  const fileNames = allFiles.map((file) => file.name);

  // run the transformations
  const transformationKeys = Object.keys(
    transformers
  ) as (keyof typeof transformers)[];

  for (let i = 0; i < transformationKeys.length; i++) {
    const transformer = transformers[transformationKeys[i]];

    await Promise.all(
      allFiles
        .filter((file) => Boolean(file.program))
        .map((file) =>
          inputFiles.transform(
            file.id,
            {
              registerMap,
              filesInProject: fileNames,
              replacementMap,
            },
            transformer
          )
        )
    );
  }

  // if there are any defines, handle them!
  if (defines.size > 0) {
    const lines: string[] = [];

    defines.forEach((value, key) => {
      lines.push(`#define ${key} ${value}`);
    });

    // create a defines file
    inputFiles.createFile({
      name: args.values["defines-file-name"],
      path: ".",
      content: lines.join("\n"),
      id: `${inputDir}/${args.values["defines-file-name"]}`,
      program: parser.parseFile(lines.join("\n")),
    });

    // add this file to each of the assembler files
    await Promise.all(
      (await inputFiles.getAllFiles()).map((file) => {
        if (file.program) {
          for (let i = 0; i < file.program.lines.length; i++) {
            const line = file.program.lines[i];

            if (isSourceLine(line, "pragma")) {
              if (line.pragma === "#include") {
                if (line.value.startsWith("<") && line.value.endsWith(">")) {
                  // after this line
                  file.program.lines.splice(i + 1, 0, {
                    type: "pragma",
                    pragma: "#include",
                    value: `"${args.values["defines-file-name"]}"`,
                  });
                  break;
                }
              }
            }
          }
        }
      })
    );
  }

  // recreate file content
  const unparser = new Unparser({
    commentSymbol: "//",
    forceLabelColons: true,
  });
  await Promise.all(
    allFiles
      .filter((file) => Boolean(file.program))
      .map((file) => {
        return inputFiles.transform(file.id, {}, async (file) => {
          file.content = unparser.unparseProgram(file.program!);
        });
      })
  );

  // output the files
  await Promise.all(
    allFiles.map((file) => {
      return outputFiles.writeFile(file);
    })
  );
}

main();
