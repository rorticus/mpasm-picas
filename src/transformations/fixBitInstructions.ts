import {
  findMneumonic,
  isASTNode,
  isSourceLine,
  parseOperand,
} from "../utils/ast";
import { FileTransformer, TransformerContext } from "./types";

const bitInstructions = [
  "bcf", // bit clear f
  "bsf", // bit set f
  "btfsc", // bit test f, skip if clear
  "btfss", // bit test f, skip if set
];

export const fixBitInstructions: FileTransformer<TransformerContext> = async (
  file,
  context
) => {
  const flagRemaps = context.registerMap ?? new Map();

  if (file.program) {
    bitInstructions.forEach((mneumonic) => {
      const instructions = findMneumonic(file.program!, mneumonic);

      instructions.forEach((inst) => {
        if (inst.operands?.length === 2) {
          // multiple flags like bcf ADCON0, ADGO
          const op1 = inst.operands[0];
          const op2 = inst.operands[1];

          if (isASTNode(op1, "identifier") && isASTNode(op2, "identifier")) {
            const remapped = flagRemaps.get(
              `${op1.name}.${op2.name}`.toLowerCase()
            );

            if (remapped) {
              inst.operands = remapped.split(".").map(parseOperand);

              if (!inst.comment) {
                inst.comment = `${op1.name}.${op2.name}`;
              }
            }
          }
        }
      });
    });

    file.program.lines.forEach((line) => {
      if (isSourceLine(line, "define")) {
        if (line.operands?.length === 2) {
          // multiple flags like bcf ADCON0, ADGO
          const op1 = line.operands[0];
          const op2 = line.operands[1];

          if (isASTNode(op1, "identifier") && isASTNode(op2, "identifier")) {
            const remapped = flagRemaps.get(
              `${op1.name}.${op2.name}`.toLowerCase()
            );

            if (remapped) {
              line.operands = [parseOperand(remapped)];
            }
          }
        }
      }
    });
  }
};
