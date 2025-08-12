import { findAssignmentOperand, findMneumonic, isASTNode } from "../utils/ast";
import { FileTransformer, TransformerContext } from "./types";

export const fixIncludes: FileTransformer<TransformerContext> = async (
  file,
  { filesInProject = [] }
) => {
  // find the chip
  if (file.program) {
    // find any includes that include <chipNumber.inc>
    const pragmas = file.program.lines.filter((l) => l.type === "pragma");
    const includes = pragmas.filter((p) => p.pragma === "#include");

    // convert <> includes to "" includes
    includes.forEach((include) => {
      if (include.value.startsWith("<") && include.value.endsWith(">")) {
        include.value = `"${include.value.slice(1, -1)}"`;
      }
    });

    // fix file import casing
    includes.forEach((include) => {
      const justTheHeader = include.value.slice(1, -1);
      const realFile = filesInProject.find(
        (f) => f.toLowerCase() === justTheHeader.toLowerCase()
      );

      if (realFile && realFile !== justTheHeader) {
        include.value = `"${realFile}"`;
      }
    });

    const [list] = findMneumonic(file.program, "list");

    if (list) {
      const p = findAssignmentOperand(list, "p");

      if (isASTNode(p, "chip-number")) {
        const chipNumber = p.value;

        includes.forEach((include) => {
          if (include.value === `"p${chipNumber}.inc"`) {
            include.value = "<xc.inc>";
          }
        });
      }
    }
  }
};
