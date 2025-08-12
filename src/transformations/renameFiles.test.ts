import { describe } from "node:test";
import { expect, it } from "vitest";
import { renameFiles } from "./renameFiles";

describe("RenameFiles", () => {
  it("renames asm files", async () => {
    const file = {
      id: "1",
      name: "test.asm",
      path: ".",
      content: "",
      program: null,
    };

    await renameFiles(file, {});

    expect(file.name).toBe("test.s");
  });
});
