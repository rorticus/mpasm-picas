import { describe, it } from "vitest";
import { expectOutput, runTransformer } from "./tests";
import { fixIfdefs } from "./fixIfdefs";

describe("FixIfdefs", () => {
  it("converts ifdefs into pragmas", async () => {
    const output = await runTransformer(
      "test.asm",
      `
  ifdef MY_THING
            `,
      fixIfdefs,
      {}
    );

    expectOutput(output).toBe(`
#ifdef MY_THING
        `);
  });

  it("converts endifs into pragmas", async () => {
    const output = await runTransformer(
      "test.asm",
      `
  ifdef MY_THING
  endif
            `,
      fixIfdefs,
      {}
    );

    expectOutput(output).toBe(`
#ifdef MY_THING
#endif
        `);
  });

  it("does not convert endifs into pragmas if they belong to ifs", async () => {
    const output = await runTransformer(
      "test.asm",
      `
  if MY_THING
  endif
            `,
      fixIfdefs,
      {}
    );

    expectOutput(output).toBe(`
if MY_THING
endif
        `);
  });
});
