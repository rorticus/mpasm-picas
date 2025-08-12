import { findMneumonic } from "../utils/ast";
import { FileTransformer, TransformerContext } from "./types";

/**
 * Fix RES statements
 *
 * In MPASM you would have
 *
 * LABEL: RES 1
 *
 * In PIC-AS, you would have
 *
 * LABEL: DS 1
 *
 */
export const fixRes: FileTransformer<TransformerContext> = async (file) => {
  if (file.program) {
    const ress = findMneumonic(file.program, "res");

    ress.forEach((res) => {
      res.mneumonic = "DS";
    });
  }
};
