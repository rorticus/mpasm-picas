import { isSourceLine, walkAllOperands } from "../utils/ast";
import { FileTransformer, TransformerContext } from "./types";

const ignoreMneumonics = new Set(["moviw", "movwi"]);

export const replaceIdentifiers: FileTransformer<TransformerContext> = async (
  file,
  context
) => {
  if (!context.replacementMap) {
    return;
  }

  const { replacementMap } = context;

  if (file.program) {
    walkAllOperands(file.program!, "identifier", (id, { sourceLine }) => {
      if (isSourceLine(sourceLine, "program")) {
        if (ignoreMneumonics.has(sourceLine.mneumonic?.toLowerCase() || "")) {
          return;
        }
      }

      const replacedValue = replacementMap.get(id.name);
      if (replacedValue) {
        id.name = replacedValue;
        id.token.value = replacedValue;
      }
    });
  }
};
