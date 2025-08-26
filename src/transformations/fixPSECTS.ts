import { findMneumonic, isASTNode, parseOperand } from "../utils/ast";
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
export const fixPSECTs: FileTransformer<TransformerContext> = async (
  file,
  { psectOrigins }
) => {
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

      const location = code?.operands?.[0];

      if (isASTNode(location, "number")) {
        // this code section needs a little more love because its absolutely positioned
        const lineIndex =
          file.program?.lines.findIndex((l) => l === code) ?? -1;
        if (lineIndex >= 0) {
          file.program!.lines.splice(
            lineIndex,
            2,
            {
              type: "program",
              label: codeName,
              mneumonic: "PSECT",
              operands: [
                parseOperand(codeName),
                parseOperand("class=CODE"),
                parseOperand("delta=2"),
                parseOperand("abs"),
              ],
              comment: "",
            },
            {
              type: "program",
              mneumonic: "ORG",
              operands: [location],
              comment: "",
            }
          );
        }
      } else {
        code.label = "";
        code.mneumonic = "PSECT";
        code.operands = [
          parseOperand(codeName),
          parseOperand("class=CODE"),
          parseOperand("delta=2"),
        ];
      }
    });
  }
};
