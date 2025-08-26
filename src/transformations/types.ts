import { File } from "../adapters";

export type FileTransformer<T = any> = (
  file: File,
  context: T
) => Promise<void>;

export type TransformerContext = {
  registerMap?: Map<string, string>;
  replacementMap?: Map<string, string>;
  filesInProject?: string[];
  psectOrigins?: Map<string, number>;
};
