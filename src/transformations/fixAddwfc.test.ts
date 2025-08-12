import { describe, it } from "vitest";
import { expectOutput, runTransformer } from "./tests";
import { fixAddwfc } from "./fixAddwfc";

describe("Fix ADDWFC and SUBWFB mneumonics", () => {
  it("fixes ADDWFC instructions", async () => {
    const output = await runTransformer(
      "test.asm",
      `
    addwfc FSR1L, FSR1L
    addwfc FSR0, 1

            `,
      fixAddwfc,
      {}
    );

    expectOutput(output).toBe(`
addwfc FSR1L, f
addwfc FSR0, 1
        `);
  });

  it("fixes SUBWFB instructions", async () => {
    const output = await runTransformer(
      "test.asm",
      `
    subwfb FSR1L, FSR1L
    subwfb FSR0, 1

            `,
      fixAddwfc,
      {}
    );

    expectOutput(output).toBe(`
subwfb FSR1L, f
subwfb FSR0, 1
        `);
  });
});
