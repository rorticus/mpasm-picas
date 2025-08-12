// tool to build a mapping from the old MPASM bit fields to the new pic-as bit fields.

import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { Parser } from "./parser";
import { isASTNode, isSourceLine } from "./utils/ast";
import { posix } from "node:path";

const args = parseArgs({
  options: {
    ini: {
      type: "string",
    },
  },
});

const { ini } = args.values;

if (!ini) {
  console.error("The --ini option is required.");
  process.exit(1);
}

// verify the ini file exists

if (!existsSync(ini)) {
  console.error(`Input file "${ini}" does not exist.`);
  process.exit(1);
}

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

const mappings = new Map<string, string>();

// find all the 16 bit registers
sfrs.forEach((sfr) => {
  if (sfr.size === 16) {
    // find the first register at the same address, but 8 bits
    const eightBitSFR = sfrs.find(
      (s) => s.address === sfr.address && s.size === 8
    );
    if (eightBitSFR) {
      // Map the 16-bit SFR to the 8-bit SFR
      mappings.set(sfr.name, eightBitSFR.name);
    }
  }
});

// output the mappings
mappings.forEach((value, key) => {
  console.log(`${key}=${value}`);
});
