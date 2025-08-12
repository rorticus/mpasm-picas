import { findMneumonic, isASTNode, parseOperand } from "../utils/ast";
import { FileTransformer, TransformerContext } from "./types";

/**
 * Fix addfsr instructions to use the correct pic-as syntax. From MPASM, we look at the FSR being passed in
 * and use the number as our first parameter.
 *
 * mpasm:
 * addfsr FSR1L, 0x1
 *
 * pic-as
 * addfsr 0, 1
 *
 * @param file
 */
export const fixADDFSR: FileTransformer<TransformerContext> = async (file) => {
  if (file.program) {
    findMneumonic(file.program, "addfsr").forEach((line) => {
      const op1 = line.operands?.[0];
      const op2 = line.operands?.[1];

      if (isASTNode(op1, "identifier") && isASTNode(op2, "number")) {
        if (op1.name.startsWith("FSR")) {
          // got it! grab the number
          let num = op1.name.slice(3, 4);

          line.operands = [parseOperand(num), op2];
        }
      }
    });
  }
};
