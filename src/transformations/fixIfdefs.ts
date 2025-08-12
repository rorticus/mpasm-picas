import { findMneumonic, isASTNode, isSourceLine } from "../utils/ast";
import { FileTransformer, TransformerContext } from "./types";

export const fixIfdefs: FileTransformer<TransformerContext> = async (file) => {
  for (let i = 0; i < (file.program?.lines.length ?? 0); i++) {
    const line = file.program!.lines[i];

    if (isSourceLine(line, "program")) {
      if (line.mneumonic?.toLowerCase() === "ifdef") {
        const identifer = line.operands?.[0];

        if (isASTNode(identifer, "identifier")) {
          Object.assign(line, {
            type: "pragma",
            value: `#ifdef ${identifer.name}`,
          });

          // convert the next endif we see to a prgrama
          for (let j = i; j < file.program!.lines.length; j++) {
            const nextLine = file.program!.lines[j];
            if (isSourceLine(nextLine, "program")) {
              if (nextLine.mneumonic?.toLowerCase() === "endif") {
                Object.assign(nextLine, {
                  type: "pragma",
                  value: "#endif",
                });
                break; // stop after the first endif
              }
            }
          }
        }
      }
    }
  }
};
