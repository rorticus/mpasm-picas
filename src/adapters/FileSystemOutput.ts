import { resolve } from "node:path";
import { File, OutputAdapter } from "./types";
import { writeFileSync } from "node:fs";

export class FileSystemOutput implements OutputAdapter {
  dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  async writeFile(file: File): Promise<void> {
    const filePath = resolve(file.path, this.dir, file.name);

    console.log(`Writing file: ${filePath}`);

    writeFileSync(filePath, file.content, {
      encoding: "utf-8",
    });
  }
}
