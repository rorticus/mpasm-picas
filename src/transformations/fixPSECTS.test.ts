import { describe, it } from "vitest";
import { expectOutput, runTransformer } from "./tests";
import { fixPSECTs } from "./fixPSECTS";

describe("FixPSECTs", () => {
  it("fixes udata sections", async () => {
    const output = await runTransformer(
      "test.asm",
      `
MATH_DATA           UDATA ; 0x120
            `,
      fixPSECTs,
      {}
    );

    expectOutput(output).toBe(`
PSECT MATH_DATA, class=UDATA ; 0x120
        `);
  });
});
