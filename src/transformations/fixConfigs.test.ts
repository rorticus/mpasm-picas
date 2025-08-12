import { describe, it } from "vitest";
import { expectOutput, runTransformer } from "./tests";
import { fixConfigs } from "./fixConfigs";

describe("FixConfigs", () => {
  it("fixes configs", async () => {
    const output = await runTransformer(
      "test.asm",
      `
    __CONFIG _CONFIG1, _FOSC_HS & _WDTE_OFF & _PWRTE_ON & _MCLRE_ON & _CP_ON & _CPD_OFF & _BOREN_ON & _CLKOUTEN_ON & _IESO_OFF & _FCMEN_OFF
    __CONFIG _CONFIG2, _WRT_OFF & _VCAPEN_OFF & _PLLEN_OFF & _STVREN_OFF & _BORV_19 & _LVP_OFF

            `,
      fixConfigs,
      {}
    );

    expectOutput(output).toBe(`
config FOSC=HS, WDTE=OFF, PWRTE=ON, MCLRE=ON, CP=ON, CPD=OFF, BOREN=ON, CLKOUTEN=ON, IESO=OFF, FCMEN=OFF
config WRT=OFF, VCAPEN=OFF, PLLEN=OFF, STVREN=OFF, BORV=19, LVP=OFF
        `);
  });
});
