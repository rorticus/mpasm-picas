import { describe, it } from "vitest";
import { expectOutput, runTransformer } from "./tests";
import { fixFixedAddresses } from "./fixFixedAddresses";

describe("FixFixedAddresses", () => {
  it("fixes fixed addresses", async () => {
    const output = await runTransformer(
      "test.asm",
      `
 test #myaddr
            `,
      fixFixedAddresses,
      {
        filesInProject: ["test.h"],
      }
    );

    expectOutput(output).toBe(`
test myaddr
        `);
  });
});
