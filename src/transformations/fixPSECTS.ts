import { findMneumonic, parseOperand } from "../utils/ast";
import { FileTransformer, TransformerContext } from "./types";

/**
 * Convert UDATA sections to PSECTS
 *
 * In MPASM you would have
 *
 * LABEL UDATA
 *
 * But in PIC-AS you might have,
 *
 * UDATA LABEL, class=UDATA
 *
 */
export const fixPSECTs: FileTransformer<TransformerContext> = async (file) => {
  if (file.program) {
    const udatas = findMneumonic(file.program, "udata");

    udatas.map((udata) => {
      let udataName = udata.label;

      if (!udataName) {
        udataName = file.name.split(".")[0].toUpperCase() + "_UDATA";
      }

      udata.label = "";
      udata.mneumonic = "PSECT";
      udata.operands = [parseOperand(udataName), parseOperand("class=UDATA")];
    });

    const codes = findMneumonic(file.program, "code");
    codes.map((code) => {
      let codeName = code.label;
      if (!codeName) {
        codeName = file.name.split(".")[0].toUpperCase() + "_CODE";
      }

      code.label = "";
      code.mneumonic = "PSECT";
      code.operands = [
        parseOperand(codeName),
        parseOperand("class=CODE"),
        parseOperand("delta=2"),
      ];
    });
  }
};
