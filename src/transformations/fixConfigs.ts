import {
  findMneumonic,
  parseOperand,
  walkSourceLineOperands,
} from "../utils/ast";
import { FileTransformer, TransformerContext } from "./types";

/**
 * Fix configs
 *
 * In MPASM you would have
 *
 * __CONFIG _WDTE_OFF & _PWRTE_ON
 *
 * In PIC-AS, you would have
 *
 * config WDTE=OFF, PWRTE=ON
 *
 */
export const fixConfigs: FileTransformer<TransformerContext> = async (file) => {
  if (file.program) {
    const configs = findMneumonic(file.program, "__CONFIG");

    configs.forEach((config) => {
      const flags: string[] = [];

      walkSourceLineOperands(config, "identifier", (identifier) => {
        if (identifier.name.slice(1).includes("_")) {
          flags.push(identifier.name);
        }
      });

      // turn the operands into assignment nodes
      const flagNodes = flags.map((f) => {
        const parts = f.slice(1).split("_");
        const flagValue = parts.pop();
        const flagName = parts.join("_");

        return parseOperand(`${flagName}=${flagValue}`);
      });

      config.mneumonic = "config";
      config.operands = flagNodes;
    });
  }
};
