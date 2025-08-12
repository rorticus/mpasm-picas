import { expect } from "vitest";
import { File } from "../adapters";
import { Parser } from "../parser";
import { Unparser } from "../unparser";
import { FileTransformer } from "./types";

export function createTestFile(filename: string, content: string) {
  const parser = new Parser();
  const program = parser.parseFile(content);
  return {
    id: "1",
    name: filename,
    path: ".",
    content,
    program,
  };
}

export async function runTransformer<T>(
  filename: string,
  content: string,
  transformer: FileTransformer<T>,
  context: T
) {
  const testFile = createTestFile(filename, content);
  await transformer(testFile, context);

  const unparser = new Unparser({
    forceLabelColons: true,
  });
  return unparser.unparseProgram(testFile.program!);
}

export function expectOutput(output: string) {
  const trimmedOutput = output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  return {
    toBe(expected: string) {
      const trimmedExpected = expected
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n");

      expect(trimmedOutput).toBe(trimmedExpected);
    },
  };
}
