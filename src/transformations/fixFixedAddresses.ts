import { walkAllOperands } from "../utils/ast";
import { FileTransformer, TransformerContext } from "./types";

export const fixFixedAddresses: FileTransformer<TransformerContext> = async (
  file
) => {
  if (file.program) {
    walkAllOperands(file.program, "unary", (node) => {
      if (node.op === "pound") {
        Object.assign(node, node.expression);
      }
    });
  }
};
