import { findMneumonic } from "../utils/ast";
import { FileTransformer, TransformerContext } from "./types";

/**
 * Convert externs
 *
 * In MPASM you would have
 *
 * EXTERN One, Two
 *
 *
 * In PIC-AS it's
 *
 * GLOBAL One, Two
 *
 */
export const fixExterns: FileTransformer<TransformerContext> = async (file) => {
  if (file.program) {
    const externs = findMneumonic(file.program, "extern");

    for (const extern of externs) {
      extern.mneumonic = "GLOBAL";
    }
  }
};
