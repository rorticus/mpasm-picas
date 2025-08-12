import { describe, it } from "vitest";
import { expectOutput, runTransformer } from "./tests";
import { replaceIdentifiers } from "./replaceIdentifiers";

describe("FixPSECTs", () => {
  it("fixes udata sections", async () => {
    const output = await runTransformer(
      "test.asm",
      `
 incf FSR1, f
            `,
      replaceIdentifiers,
      {
        replacementMap: new Map([["FSR1", "FSR1L"]]),
      }
    );

    expectOutput(output).toBe(`
incf FSR1L, f
        `);
  });

  it("doesn't touch movwi instructions", async () => {
    const output = await runTransformer(
      "test.asm",
      `
 movwi FSR1, f
            `,
      replaceIdentifiers,
      {
        replacementMap: new Map([["FSR1", "FSR1L"]]),
      }
    );

    expectOutput(output).toBe(`
movwi FSR1, f
        `);
  });
});
