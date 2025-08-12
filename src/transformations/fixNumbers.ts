import { NumberASTNode } from "../parser";
import { isSourceLine, walkAllOperands, walkOperands } from "../utils/ast";
import { FileTransformer, TransformerContext } from "./types";

function transformOperand(node: NumberASTNode) {
  if (node.radix === 16) {
    node.token.value = `0x${node.value.toString(16).toUpperCase()}`;
  } else if (node.radix === 2) {
    node.token.value = `${node.value.toString(2)}B`;
  } else if (node.radix === 10) {
    node.token.value = `${node.value.toString(10)}`;
  } else if (node.radix === 8) {
    node.token.value = `${node.value.toString(8)}q`;
  }
}

export const fixNumbers: FileTransformer<TransformerContext> = async (file) => {
  if (file.program) {
    walkAllOperands(file.program, "number", transformOperand);

    file.program.lines.forEach((line) => {
      if (isSourceLine(line, "define")) {
        walkOperands(line.operands || [], "number", transformOperand);
      }
    });
  }
};
