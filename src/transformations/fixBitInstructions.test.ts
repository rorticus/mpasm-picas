import { describe, it } from "vitest";
import { expectOutput, runTransformer } from "./tests";
import { fixBitInstructions } from "./fixBitInstructions";

describe("FixBitInstructions", () => {
  it("fixes bit instructions that are remapped", async () => {
    const output = await runTransformer(
      "test.asm",
      `
CmpRes: DS 2
    btfss STATUS,Z
    btfss CmpRes, Test

            `,
      fixBitInstructions,
      {
        registerMap: new Map([["status.z", "ZERO"]]),
      }
    );

    expectOutput(output).toBe(`
CmpRes: DS 2
btfss ZERO ; STATUS.Z
btfss CmpRes, Test
        `);
  });

  it("fixes bit instructions that are remapped in a define", async () => {
    const output = await runTransformer(
      "test.asm",
      `
#define Test STATUS, Z
    btfss Test
            `,
      fixBitInstructions,
      {
        registerMap: new Map([["status.z", "ZERO"]]),
      }
    );

    expectOutput(output).toBe(`
#define Test ZERO
    btfss Test
        `);
  });

  it("fixes bit instructions with two operands", async () => {
    const output = await runTransformer(
      "test.asm",
      `
    btfss STATUS, Z
            `,
      fixBitInstructions,
      {
        registerMap: new Map([["status.z", "STATUS.ZERO"]]),
      }
    );

    expectOutput(output).toBe(`
    btfss STATUS, ZERO ; STATUS.Z
        `);
  });
});
