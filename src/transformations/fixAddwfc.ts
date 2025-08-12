import { ProgramLine } from "../parser";
import { findMneumonic, isASTNode, parseOperand } from "../utils/ast";
import { FileTransformer, TransformerContext } from "./types";

export const fixAddwfc: FileTransformer<TransformerContext> = async (file) => {
  function doReplacement(line: ProgramLine) {
    const op1 = line.operands?.[0];
    const op2 = line.operands?.[1];

    if (isASTNode(op1, "identifier") && isASTNode(op2, "identifier")) {
      if (op1.name === op2.name) {
        line.operands = [op1, parseOperand("f")];
      }
    }
  }

  findMneumonic(file.program, "addwfc").forEach(doReplacement);
  findMneumonic(file.program, "subwfb").forEach(doReplacement);
};
