import { describe, expect, it } from "vitest";
import { Parser } from "./parser";
import {
  BinaryASTNode,
  CallASTNode,
  DefineLine,
  NumberASTNode,
  PragmaLine,
  ProgramLine,
  UnaryASTNode,
} from "./types";
import { isSourceLine } from "../utils/ast";

describe("Parser Tests", () => {
  describe("labels", () => {
    it("parses identifiers in column 0 as labels", () => {
      const parser = new Parser();
      const result = parser.parseLine("label hello", 1) as ProgramLine;

      expect(result.type).toBe("program");
      expect(result.label).toBe("label");
    });

    it("parses labels with colons as labels", () => {
      const parser = new Parser();
      const result = parser.parseLine("label: hello", 1) as ProgramLine;

      expect(result.label).toBe("label");
    });

    it("does not parse identifiers on column 2 as labels", () => {
      const parser = new Parser();
      const result = parser.parseLine(" label hello", 1) as ProgramLine;

      expect(result.label).toBeUndefined();
    });
  });

  describe("comments", () => {
    it("can parse comments", () => {
      const parser = new Parser();
      const result = parser.parseLine("; hello", 1) as ProgramLine;

      expect(result.comment).toEqual("hello");
    });
  });

  describe("expressions", () => {
    it("parses a single operand", () => {
      const parser = new Parser();
      const result = parser.parseLine(" test 1+2", 1) as ProgramLine;

      const binary = result.operands?.[0] as BinaryASTNode;

      expect(result.operands).toHaveLength(1);
      expect(result.operands?.[0].type).toBe("binary");
      expect(binary?.op).toBe("plus");
    });

    it("parses multiple operands", () => {
      const parser = new Parser();
      const result = parser.parseLine(" test 1+2, 'c'", 1) as ProgramLine;

      expect(result.operands).toHaveLength(2);
    });

    it("parses address of operators", () => {
      const parser = new Parser();
      const result = parser.parseLine(" test #hi", 1) as ProgramLine;

      const operand = result.operands?.[0] as UnaryASTNode;

      expect(result.operands).toHaveLength(1);
      expect(result.operands?.[0].type).toBe("unary");
      expect(operand?.op).toBe("pound");
      expect(operand?.expression.type).toBe("identifier");
    });

    it("parses macro calls", () => {
      const parser = new Parser();
      const result = parser.parseLine(" test seven(8, 9)", 1) as ProgramLine;

      const op = result.operands?.[0] as CallASTNode;

      expect(result.operands).toHaveLength(1);
      expect(op.type).toBe("call");
      expect(op.callee.name).toBe("seven");
      expect(op.args).toHaveLength(2);
      expect(op.args[0].type).toBe("number");
      expect(op.args[1].type).toBe("number");
    });

    describe("numbers", () => {
      it("parses decimal numbers", () => {
        const parser = new Parser();
        const result = parser.parseLine(" test .14, D'2'", 1) as ProgramLine;

        const op1 = result.operands?.[0] as NumberASTNode;
        const op2 = result.operands?.[1] as NumberASTNode;

        expect(op1.type).toBe("number");
        expect(op1.value).toBe(14);
        expect(op1.radix).toBe(10);

        expect(op2.type).toBe("number");
        expect(op2.value).toBe(2);
        expect(op2.radix).toBe(10);
      });

      it("parses binary numbers", () => {
        const parser = new Parser();
        const result = parser.parseLine(" test B'00000101'", 1) as ProgramLine;

        const op1 = result.operands?.[0] as NumberASTNode;

        expect(op1.type).toBe("number");
        expect(op1.value).toBe(5);
        expect(op1.radix).toBe(2);
      });

      it("parses hexadecimal numbers", () => {
        const parser = new Parser();
        const result = parser.parseLine(" test H'1A', 2B", 1) as ProgramLine;

        const op1 = result.operands?.[0] as NumberASTNode;
        const op2 = result.operands?.[1] as NumberASTNode;

        expect(op1.type).toBe("number");
        expect(op1.value).toBe(0x1a);
        expect(op1.radix).toBe(16);

        expect(op2.type).toBe("number");
        expect(op2.value).toBe(0x2b);
        expect(op2.radix).toBe(16);
      });

      it("parses octal numbers", () => {
        const parser = new Parser();
        const result = parser.parseLine(" test O'17'", 1) as ProgramLine;

        const op1 = result.operands?.[0] as NumberASTNode;

        expect(op1.type).toBe("number");
        expect(op1.value).toBe(15);
        expect(op1.radix).toBe(8);
      });
    });
  });

  describe("pragmas", () => {
    it("parses pragmas", () => {
      const parser = new Parser();
      const result = parser.parseLine("#include <test.h>", 1) as PragmaLine;

      expect(result.type).toBe("pragma");
      expect(result.pragma).toBe("#include");
      expect(result.value).toBe("<test.h>");
    });

    it("parsese comments in pragmas", () => {
      const parser = new Parser();
      const result = parser.parseLine(
        "#include <test.h> ; hello",
        1
      ) as PragmaLine;

      expect(result.type).toBe("pragma");
      expect(result.pragma).toBe("#include");
      expect(result.value).toBe("<test.h>");
      expect(result.comment).toEqual("hello");
    });
  });

  describe("defines", () => {
    it("parses define directives", () => {
      const parser = new Parser();
      const result = parser.parseLine("#define TEST 1", 1);

      expect(isSourceLine(result, "define")).toBe(true);
      const define = result as DefineLine;

      expect(define.name).toBe("TEST");
      expect(define.operands).toHaveLength(1);
    });
  });
});
