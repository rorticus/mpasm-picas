import { Program } from "../parser";
import { FileTransformer } from "../transformations/types";

export interface File {
  id: string;
  name: string;
  path: string;
  content: string;
  program: Program | null;
}

export interface InputAdapter {
  getAllFiles(): Promise<File[]>;
  createFile(file: File): void;
  transform<T>(
    id: string,
    context: T,
    transformer: FileTransformer<T>
  ): Promise<void>;
}

export interface OutputAdapter {
  writeFile(file: File): Promise<void>;
}
