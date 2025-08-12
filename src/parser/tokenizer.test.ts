import { describe, expect, it } from "vitest";
import { Token } from "./tokens";
import { Tokenizer } from "./tokenizer";

function tokenize(str: string) {
  const tokens: Token[] = [];
  const tokenizer = new Tokenizer(str, 1);

  while (true) {
    const token = tokenizer.next();
    if (token.type === "eof") {
      break;
    }
    tokens.push(token);
  }

  return tokens;
}

describe("Tokenizer Tests", () => {
  describe("strings", () => {
    it("should parse a string", () => {
      const result = tokenize('"hello world"');
      expect(result).toEqual([
        {
          type: "string",
          value: '"hello world"',
          column: 0,
          line: 1,
        },
      ]);
    });
  });

  describe("numbers", () => {
    it("should parse a binary number", () => {
      const result = tokenize("B'1010101'");
      expect(result).toEqual([
        {
          type: "number",
          value: "B'1010101'",
          column: 0,
          line: 1,
        },
      ]);
    });

    it("should parse a decimal number", () => {
      const result = tokenize("D'12345'");
      expect(result).toEqual([
        {
          type: "number",
          value: "D'12345'",
          column: 0,
          line: 1,
        },
      ]);
    });

    it("should parse a decimal number with a period", () => {
      const result = tokenize(".12345");
      expect(result).toEqual([
        {
          type: "number",
          value: ".12345",
          column: 0,
          line: 1,
        },
      ]);
    });

    it("should parse a octal number", () => {
      const result = tokenize("O'12345'");
      expect(result).toEqual([
        {
          type: "number",
          value: "O'12345'",
          column: 0,
          line: 1,
        },
      ]);
    });

    it("should parse a hex number", () => {
      const result = tokenize("H'12345'");
      expect(result).toEqual([
        {
          type: "number",
          value: "H'12345'",
          column: 0,
          line: 1,
        },
      ]);
    });
  });

  describe("identifiers", () => {
    it("should parse a simple identifier", () => {
      const result = tokenize("myIdentifier");
      expect(result).toEqual([
        {
          type: "identifier",
          value: "myIdentifier",
          column: 0,
          line: 1,
        },
      ]);
    });
  });

  describe("operators", () => {
    it("parses a program counter", () => {
      const result = tokenize("$");
      expect(result).toEqual([
        {
          type: "program-counter",
          column: 0,
          line: 1,
          value: "$",
        },
      ]);
    });

    it("parses parenthesis", () => {
      const result = tokenize("()");
      expect(result).toEqual([
        {
          type: "open-paren",
          column: 0,
          line: 1,
          value: "(",
        },
        {
          type: "close-paren",
          column: 1,
          line: 1,
          value: ")",
        },
      ]);
    });

    it("parses multiplication", () => {
      const result = tokenize("*");
      expect(result).toEqual([
        {
          type: "multiply",
          column: 0,
          line: 1,
          value: "*",
        },
      ]);
    });

    it("parses multiplication equals", () => {
      const result = tokenize("*=");
      expect(result).toEqual([
        {
          type: "multiply-equals",
          column: 0,
          line: 1,
          value: "*=",
        },
      ]);
    });

    it("parses division", () => {
      const result = tokenize("/");
      expect(result).toEqual([
        {
          type: "divide",
          column: 0,
          line: 1,
          value: "/",
        },
      ]);
    });

    it("parses division equals", () => {
      const result = tokenize("/=");
      expect(result).toEqual([
        {
          type: "divide-equals",
          column: 0,
          line: 1,
          value: "/=",
        },
      ]);
    });

    it("parses modulus", () => {
      const result = tokenize("%");
      expect(result).toEqual([
        {
          type: "modulus",
          column: 0,
          line: 1,
          value: "%",
        },
      ]);
    });

    it("parses modulus equals", () => {
      const result = tokenize("%=");
      expect(result).toEqual([
        {
          type: "modulus-equals",
          column: 0,
          line: 1,
          value: "%=",
        },
      ]);
    });

    it("parses plus", () => {
      const result = tokenize("+");
      expect(result).toEqual([
        {
          type: "plus",
          column: 0,
          line: 1,
          value: "+",
        },
      ]);
    });

    it("parses plus equals", () => {
      const result = tokenize("+=");
      expect(result).toEqual([
        {
          type: "plus-equals",
          column: 0,
          line: 1,
          value: "+=",
        },
      ]);
    });

    it("parses minus", () => {
      const result = tokenize("-");
      expect(result).toEqual([
        {
          type: "minus",
          column: 0,
          line: 1,
          value: "-",
        },
      ]);
    });

    it("parses minus equals", () => {
      const result = tokenize("-=");
      expect(result).toEqual([
        {
          type: "minus-equals",
          column: 0,
          line: 1,
          value: "-=",
        },
      ]);
    });

    it("parses left shift operator", () => {
      const result = tokenize("<<");
      expect(result).toEqual([
        {
          type: "left-shift",
          column: 0,
          line: 1,
          value: "<<",
        },
      ]);
    });

    it("parses left shift equals operator", () => {
      const result = tokenize("<<=");
      expect(result).toEqual([
        {
          type: "left-shift-equals",
          column: 0,
          line: 1,
          value: "<<=",
        },
      ]);
    });

    it("parses right shift operator", () => {
      const result = tokenize(">>");
      expect(result).toEqual([
        {
          type: "right-shift",
          column: 0,
          line: 1,
          value: ">>",
        },
      ]);
    });

    it("parses right shift equals operator", () => {
      const result = tokenize(">>=");
      expect(result).toEqual([
        {
          type: "right-shift-equals",
          column: 0,
          line: 1,
          value: ">>=",
        },
      ]);
    });

    it("greater than equals operator", () => {
      const result = tokenize(">=");
      expect(result).toEqual([
        {
          type: "greater-than-equal",
          column: 0,
          line: 1,
          value: ">=",
        },
      ]);
    });

    it("less than equals operator", () => {
      const result = tokenize("<=");
      expect(result).toEqual([
        {
          type: "less-than-equal",
          column: 0,
          line: 1,
          value: "<=",
        },
      ]);
    });

    it("less than operator", () => {
      const result = tokenize("<");
      expect(result).toEqual([
        {
          type: "less-than",
          column: 0,
          line: 1,
          value: "<",
        },
      ]);
    });

    it("greater than operator", () => {
      const result = tokenize(">");
      expect(result).toEqual([
        {
          type: "greater-than",
          column: 0,
          line: 1,
          value: ">",
        },
      ]);
    });

    it("equal to operator", () => {
      const result = tokenize("==");
      expect(result).toEqual([
        {
          type: "equal-to",
          column: 0,
          line: 1,
          value: "==",
        },
      ]);
    });

    it("not equal to operator", () => {
      const result = tokenize("!=");
      expect(result).toEqual([
        {
          type: "not-equal-to",
          column: 0,
          line: 1,
          value: "!=",
        },
      ]);
    });

    it("logical and operator", () => {
      const result = tokenize("&&");
      expect(result).toEqual([
        {
          type: "logical-and",
          column: 0,
          line: 1,
          value: "&&",
        },
      ]);
    });

    it("boolean and operator", () => {
      const result = tokenize("&");
      expect(result).toEqual([
        {
          type: "boolean-and",
          column: 0,
          line: 1,
          value: "&",
        },
      ]);
    });

    it("and equals operator", () => {
      const result = tokenize("&=");
      expect(result).toEqual([
        {
          type: "and-equals",
          column: 0,
          line: 1,
          value: "&=",
        },
      ]);
    });

    it("boolean or operator", () => {
      const result = tokenize("|");
      expect(result).toEqual([
        {
          type: "boolean-or",
          column: 0,
          line: 1,
          value: "|",
        },
      ]);
    });

    it("logical or operator", () => {
      const result = tokenize("||");
      expect(result).toEqual([
        {
          type: "logical-or",
          column: 0,
          line: 1,
          value: "||",
        },
      ]);
    });

    it("or equals operator", () => {
      const result = tokenize("|=");
      expect(result).toEqual([
        {
          type: "or-equals",
          column: 0,
          line: 1,
          value: "|=",
        },
      ]);
    });

    it("boolean xor operator", () => {
      const result = tokenize("^");
      expect(result).toEqual([
        {
          type: "boolean-xor",
          column: 0,
          line: 1,
          value: "^",
        },
      ]);
    });

    it("xor equals operator", () => {
      const result = tokenize("^=");
      expect(result).toEqual([
        {
          type: "xor-equals",
          column: 0,
          line: 1,
          value: "^=",
        },
      ]);
    });

    it("parses the equals operator", () => {
      const result = tokenize("=");
      expect(result).toEqual([
        {
          type: "equals",
          column: 0,
          line: 1,
          value: "=",
        },
      ]);
    });

    it("parses increment", () => {
      const result = tokenize("++");
      expect(result).toEqual([
        {
          type: "increment",
          column: 0,
          line: 1,
          value: "++",
        },
      ]);
    });

    it("parses decrement", () => {
      const result = tokenize("--");
      expect(result).toEqual([
        {
          type: "decrement",
          column: 0,
          line: 1,
          value: "--",
        },
      ]);
    });

    it("parses chip numbers", () => {
      const result = tokenize(
        "list	p=16f1939	; list directive to define processor",
      );

      expect(result[3]).toEqual({
        type: "chip-number",
        column: 7,
        line: 1,
        value: "16f1939",
      });
    });
  });
});
