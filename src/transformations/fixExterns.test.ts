import { describe, it } from "vitest";
import { expectOutput, runTransformer } from "./tests";
import { fixExterns } from "./fixExterns";

describe("FixExterns", () => {
  it("fixes externs", async () => {
    const output = await runTransformer(
      "test.asm",
      `
        EXTERN One, Two
            `,
      fixExterns,
      {}
    );

    expectOutput(output).toBe(`
GLOBAL One, Two
        `);
  });
});
