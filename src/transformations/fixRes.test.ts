import { describe, it } from "vitest";
import { expectOutput, runTransformer } from "./tests";
import { fixRes } from "./fixRes";

describe("FixRes", () => {
  it("fixes RES statements", async () => {
    const output = await runTransformer(
      "test.asm",
      `
LABEL RES 5
            `,
      fixRes,
      {}
    );

    expectOutput(output).toBe(`
LABEL: DS 5
        `);
  });
});
