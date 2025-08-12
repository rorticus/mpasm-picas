import { describe, expect, it } from "vitest";
import { Parser } from "../parser";
import { Unparser } from "./unparser";
import { expectOutput } from "../transformations/tests";

describe("unparser", () => {
  it("unparsers a program", () => {
    const source = `
;
; Sample MPASM Source Code. For illustration only.
;

        list p=16c54
Dest    equ H'0B'
        org H'01FF'
        goto Start
        org H'0000'
Start   movlw H'0A'
        movwf Dest
        bcf Dest, 3
        goto Start
        end
`;

    const parser = new Parser();
    const unparser = new Unparser({
      forceLabelColons: true,
    });
    const program = parser.parseFile(source);

    const output = unparser.unparseProgram(program);

    expect(output.length).toBeGreaterThan(0);
  });

  it("doesn't add colons to some labels", () => {
    const source = `
LOW_VOLT_VAL		EQU	.684	;ADC count at which battery voltage is considered low.
`;

    const parser = new Parser();
    const unparser = new Unparser({
      forceLabelColons: true,
    });
    const program = parser.parseFile(source);

    const output = unparser.unparseProgram(program);

    expectOutput(output).toBe(
      `LOW_VOLT_VAL EQU .684 ; ADC count at which battery voltage is considered low.`
    );
  });

  it("adds low/high back", () => {
    const source = `
 movlw LOW  REG_Z
`;

    const parser = new Parser();
    const unparser = new Unparser({
      forceLabelColons: true,
    });
    const program = parser.parseFile(source);

    const output = unparser.unparseProgram(program);

    expectOutput(output).toBe(`movlw LOW REG_Z`);
  });

  it("unparses defines", () => {
    const source = `
#define TEST 1, 2

 bitfs TEST
`;

    const parser = new Parser();
    const unparser = new Unparser({
      forceLabelColons: true,
    });
    const program = parser.parseFile(source);

    const output = unparser.unparseProgram(program);

    expectOutput(output).toBe(`
#define TEST 1, 2

bitfs TEST
      `);
  });
});
