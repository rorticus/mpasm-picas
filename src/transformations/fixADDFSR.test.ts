import { describe, it } from "vitest";
import { expectOutput, runTransformer } from "./tests";
import { fixADDFSR } from "./fixADDFSR";

describe("FixADDFSR", () => {
  it("fixes addfsr instructions", async () => {
    const output = await runTransformer(
      "test.asm",
      `
 addfsr FSR1L, 0x1
 addfsr FSR0, 0

            `,
      fixADDFSR,
      {}
    );

    expectOutput(output).toBe(`
addfsr 1, 0x1
addfsr 0, 0
        `);
  });
});
