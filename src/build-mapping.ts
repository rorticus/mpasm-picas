// tool to build a mapping from the old MPASM bit fields to the new pic-as bit fields.

import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { Parser } from "./parser";
import { isASTNode, isSourceLine } from "./utils/ast";
import { posix } from "node:path";

const args = parseArgs({
  options: {
    inc: {
      type: "string",
    },
    ini: {
      type: "string",
    },
  },
});

const { inc, ini } = args.values;

if (!inc || !ini) {
  console.error("Both --inc and --ini options are required.");
  process.exit(1);
}

// verify the inc and ini files exist

if (!existsSync(inc)) {
  console.error(`Input file "${inc}" does not exist.`);
  process.exit(1);
}

if (!existsSync(ini)) {
  console.error(`Input file "${ini}" does not exist.`);
  process.exit(1);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  if (a.length > b.length) [a, b] = [b, a];

  const m = a.length,
    n = b.length;
  const prev = new Uint16Array(m + 1);
  const curr = new Uint16Array(m + 1);
  for (let i = 0; i <= m; i++) prev[i] = i;

  for (let j = 1; j <= n; j++) {
    curr[0] = j;
    const bj = b.charCodeAt(j - 1);
    for (let i = 1; i <= m; i++) {
      const cost = a.charCodeAt(i - 1) === bj ? 0 : 1;
      curr[i] = Math.min(prev[i] + 1, curr[i - 1] + 1, prev[i - 1] + cost);
    }
    prev.set(curr);
  }
  return prev[m];
}

function nearest(original: string, candidates: string[]): string {
  let best = "";
  let bestD = Infinity;
  for (const c of candidates) {
    const d = levenshtein(original, c.trim());
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }

  return best;
}

const incContent = readFileSync(inc, "utf-8");
const iniContent = readFileSync(ini, "utf-8");

type SFR = {
  name: string;
  address: number;
  size: number;
};
type SFRField = {
  name: string;
  sfrAddress: number;
  fieldBit: number;
  fieldSize: number;
};
const sfrs: SFR[] = [];
const sfrFields: SFRField[] = [];

iniContent.split("\n").forEach((line) => {
  // Process each line of the ini file
  if (line.startsWith("SFR=")) {
    const parts = line.slice("SFR=".length).split(",");
    const name = parts[0].trim();
    const address = parseInt(parts[1].trim(), 16);
    const size = parseInt(parts[2].trim(), 10);
    sfrs.push({ name, address, size });
  } else if (line.startsWith("SFRFLD=")) {
    const parts = line.slice("SFRFLD=".length).split(",");
    const name = parts[0].trim();
    const sfrAddress = parseInt(parts[1].trim(), 16);
    const fieldBit = parseInt(parts[2].trim(), 10);
    const fieldSize = parseInt(parts[3].trim(), 10);

    sfrFields.push({ name, sfrAddress, fieldBit, fieldSize });
  }
});

// parse the inc file
const parser = new Parser();
const incProgram = parser.parseFile(incContent);

const mappings = new Map<string, string>();

// for each SFRFIELD, we need to determine it's old name from the inc file, so CARRY becomes STATUS.C

sfrFields.forEach((field) => {
  const sfr = sfrs.find((s) => s.address === field.sfrAddress);

  if (!sfr) {
    console.error(
      `unable to find sfr with address ${field.sfrAddress} for field ${field.name}`
    );
    process.exit(1);
  }

  let registerName = "";

  // can we find this address in the old file?
  for (let i = 0; i < incProgram.lines.length; i++) {
    const line = incProgram.lines[i];

    if (isSourceLine(line, "program")) {
      if (line.mneumonic?.toLowerCase() === "equ") {
        const op1 = line.operands?.[0];

        if (isASTNode(op1, "number")) {
          const value = op1.value;
          if (value === field.sfrAddress && line.label) {
            registerName = line.label;
            break;
          }
        }
      }
    }
  }

  // can we find this bit? it's going to be in lines that have a comment like "STATUS bit fields"
  if (registerName) {
    let startIndex = -1;

    incProgram.lines.forEach((line, index) => {
      if (isSourceLine(line, "program")) {
        if (line.comment?.includes(`${registerName} Bits`)) {
          startIndex = index;
        }
      }
    });

    if (startIndex >= 0) {
      let endIndex = -1;
      for (let i = startIndex + 1; i < incProgram.lines.length; i++) {
        const line = incProgram.lines[i];
        if (isSourceLine(line, "program")) {
          if (!line.label && !line.mneumonic && line.comment) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex >= startIndex) {
        // find the right equ inside these lines
        let possibleMatches: string[] = [];

        for (let i = startIndex + 1; i < endIndex; i++) {
          const line = incProgram.lines[i];

          if (isSourceLine(line, "program")) {
            if (line.mneumonic?.toLowerCase() === "equ") {
              const op1 = line.operands?.[0];

              if (isASTNode(op1, "number")) {
                const value = op1.value;

                if (value === field.fieldBit && line.label) {
                  possibleMatches.push(line.label);
                }
              }
            }
          }
        }

        if (possibleMatches.length > 0) {
          const key = `${registerName}.${nearest(field.name, possibleMatches)}`;

          if (!mappings.has(key)) {
            mappings.set(key, field.name);
          }
        }
      }
    }
  }
});

// write out the new mappings
console.log(
  Array.from(mappings.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("\n")
);
