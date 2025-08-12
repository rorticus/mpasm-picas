import { describe, it } from "vitest";
import { expectOutput, runTransformer } from "./tests";
import { fixIncludes } from "./fixIncludes";

describe("FixIncludes", () => {
  it("fixes include paths", async () => {
    const output = await runTransformer(
      "test.asm",
      `
            list p=16f
            #include <p16f.inc>
            #include <Test.h>
            `,
      fixIncludes,
      {
        filesInProject: ["test.h"],
      }
    );

    expectOutput(output).toBe(`
list p=16f
#include <xc.inc>
#include "test.h"
        `);
  });
});
