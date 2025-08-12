import { join, resolve } from "node:path";
import { File, InputAdapter } from "./types";
import { readdirSync, readFileSync } from "node:fs";
import { FileTransformer } from "../transformations/types";

export class FileSystemInput implements InputAdapter {
  files: File[] = [];

  constructor(dir: string) {
    readdirSync(dir, { withFileTypes: true, recursive: true }).forEach(
      (file) => {
        if (file.isFile()) {
          const fileContent = readFileSync(
            join(file.parentPath, file.name),
            "utf-8"
          );

          this.files.push({
            id: resolve(file.parentPath, file.name),
            name: file.name,
            path: file.parentPath.replace(`${dir}`, "."),
            content: fileContent,
            program: null,
          });
        }
      }
    );
  }

  async getAllFiles(): Promise<File[]> {
    return this.files;
  }

  async transform<T>(
    id: string,
    context: T,
    transformer: FileTransformer<T>
  ): Promise<void> {
    const file = this.files.find((f) => f.id === id);
    if (file) {
      await transformer(file, context);
    } else {
      throw new Error(`File with id ${id} not found.`);
    }
  }

  createFile(file: File): void {
    this.files.push(file);
  }
}
