import { FileTransformer, TransformerContext } from "./types";

export const renameFiles: FileTransformer<TransformerContext> = async (
  file
) => {
  let { name } = file;

  if (name.endsWith(".asm")) {
    file.name = name.replace(".asm", ".s");
  }
};
