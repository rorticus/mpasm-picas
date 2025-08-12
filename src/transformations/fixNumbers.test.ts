import { describe, it } from "vitest";
import { expectOutput, runTransformer } from "./tests";
import { fixNumbers } from "./fixNumbers";

describe("fix numbers", () => {
  it("converts hexadecimal numbers to 0x format", async () => {
    const output = await runTransformer(
      "test.asm",
      ` test H'FF'`,
      fixNumbers,
      {}
    );
    expectOutput(output).toBe(`test 0xFF`);
  });

  it("converts binary numbers to 101B", async () => {
    const output = await runTransformer(
      "test.asm",
      ` test B'101'`,
      fixNumbers,
      {}
    );
    expectOutput(output).toBe(`test 101B`);
  });

  it("converts octal numbers to 101q", async () => {
    const output = await runTransformer(
      "test.asm",
      ` test O'101'`,
      fixNumbers,
      {}
    );
    expectOutput(output).toBe(`test 101q`);
  });

  it("fixes numbers in defines", async () => {
    const output = await runTransformer(
      "test.asm",
      `
#define NUM 5
 test NUM
      `,
      fixNumbers,
      {}
    );
    expectOutput(output).toBe(`
#define NUM 0x5
test NUM
`);
  });
});
