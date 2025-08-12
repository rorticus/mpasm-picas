import { TokenBuffer } from "./TokenBuffer";
import { Tokenizer } from "./tokenizer";
import {
  ChipNumberToken,
  IdentifierToken,
  NumberToken,
  StringToken,
  Token,
} from "./tokens";
import {
  ASTNode,
  IdentifierASTNode,
  NumberASTNode,
  Program,
  SourceLine,
} from "./types";

// Binding powers
const INFIX_BP: Partial<Record<Token["type"], [number, number]>> = {
  multiply: [70, 71],
  divide: [70, 71],
  modulus: [70, 71],
  plus: [60, 61],
  minus: [60, 61],
  "left-shift": [50, 51],
  "right-shift": [50, 51],
  "less-than": [40, 41],
  "less-than-equal": [40, 41],
  "greater-than": [40, 41],
  "greater-than-equal": [40, 41],
  "equal-to": [35, 36],
  "not-equal-to": [35, 36],
  "boolean-and": [32, 33],
  "boolean-xor": [31, 32],
  "boolean-or": [30, 31],
  "logical-and": [20, 21],
  "logical-or": [15, 16],
};

const ASSIGN_BP: Partial<Record<Token["type"], [number, number]>> = {
  equals: [10, 10],
  "plus-equals": [10, 10],
  "minus-equals": [10, 10],
  "multiply-equals": [10, 10],
  "divide-equals": [10, 10],
  "modulus-equals": [10, 10],
  "left-shift-equals": [10, 10],
  "right-shift-equals": [10, 10],
  "and-equals": [10, 10],
  "xor-equals": [10, 10],
  "or-equals": [10, 10],
};

const POSTFIX_BP: Partial<Record<Token["type"], number>> = {
  increment: 90,
  decrement: 90,
};

const UNARY_KEYWORDS = new Set(["high", "low", "upper"]);

const TERMINATORS = new Set([
  "comma",
  "close-paren",
  "colon",
  "comment",
  "eof",
]);

export class Parser {
  parseFile(fileContent: string): Program {
    const program: SourceLine[] = [];

    fileContent.split("\n").forEach((line, lineNumber) => {
      program.push(this.parseLine(line, lineNumber));
    });

    return {
      lines: program,
    };
  }

  parseLine(line: string, lineNumber: number): SourceLine {
    const tokenizer = new Tokenizer(line, lineNumber);
    const buffer = new TokenBuffer(tokenizer);
    let comment: string | undefined = undefined;

    if (buffer.peek().type === "pragma") {
      const parts = buffer.expect("pragma").value.split(/\s/);

      if (parts[0].trim().toLowerCase() === "#define") {
        const defineBuffer = new TokenBuffer(
          new Tokenizer(parts.slice(1).join(" "), lineNumber)
        );
        const defineIden = defineBuffer.expect("identifier");
        const defineOperands = this.parseDefineArgs(defineBuffer);

        return {
          type: "define",
          name: defineIden.value,
          operands: defineOperands,
        };
      }

      if (buffer.peek().type === "comment") {
        comment = buffer.expect("comment").value.slice(1).trim();
      }

      return {
        type: "pragma",
        pragma: parts[0].trim(),
        value: parts.slice(1).join(" ").trim(),
        comment,
      };
    }

    const sourceLine: SourceLine = {
      type: "program",
      label: undefined,
      mneumonic: undefined,
      operands: [],
      comment: undefined,
    };

    if (buffer.peek().type === "identifier" && buffer.peek().column === 0) {
      // labels must start on the first column
      const labelIdentifier = buffer.expect("identifier");

      if (buffer.peek().type === "colon") {
        buffer.consume();
      }

      sourceLine.label = labelIdentifier.value;
    }

    if (buffer.peek().type === "identifier") {
      const mneumonic = buffer.expect("identifier");
      sourceLine.mneumonic = mneumonic.value;
    }

    // Check for operands
    while (buffer.peek().type !== "comment" && buffer.peek().type !== "eof") {
      const expression = this.parseExpression(buffer);
      sourceLine.operands?.push(expression);

      // parse an operand
      if (buffer.peek().type === "comma") {
        buffer.consume();
      }
    }

    if (buffer.peek().type === "comment") {
      const comment = buffer.expect("comment");

      sourceLine.comment = comment.value.slice(1).trim();
    }

    return sourceLine;
  }

  private parseNumber(t: Token): NumberASTNode {
    // assume hexadecimal by default
    let radix: NumberASTNode["radix"] = 16;
    let numberValue = 0;

    // if the number starts with "." or "D", it's decimal
    if (t.value.startsWith(".") || t.value.startsWith("D")) {
      radix = 10;

      if (t.value.startsWith(".")) {
        // remove the leading dot
        numberValue = parseInt(t.value.slice(1), 10);
      } else {
        // remove the leading "D", the first quote, and the trailing quote
        numberValue = parseInt(t.value.slice(2, -1), 10);
      }
    } else if (t.value.startsWith("B")) {
      // binary
      radix = 2;
      numberValue = parseInt(t.value.slice(2), 2);
    } else if (
      t.value.startsWith("H") ||
      "123456789ABCDEF".includes(t.value[0].toUpperCase())
    ) {
      // hexadecimal
      radix = 16;

      if (t.value.startsWith("H")) {
        numberValue = parseInt(t.value.slice(2, -1), 16);
      } else {
        numberValue = parseInt(t.value, 16);
      }
    } else if (t.value.startsWith("O")) {
      // octal
      radix = 8;
      numberValue = parseInt(t.value.slice(2, -1), 8);
    }

    return {
      type: "number",
      token: t as NumberToken,
      value: numberValue,
      radix: radix,
    };
  }

  private nud(buffer: TokenBuffer): ASTNode {
    const t = buffer.peek();
    buffer.consume();

    switch (t.type) {
      case "number":
        return this.parseNumber(t);
      case "string":
        return {
          type: "string",
          token: t as StringToken,
          value: t.value,
        };
      case "chip-number":
        return {
          type: "chip-number",
          token: t as ChipNumberToken,
          value: t.value,
        };
      case "program-counter":
        return { type: "pc" };
      case "identifier":
        const name = t.value;
        if (UNARY_KEYWORDS.has(name.toLowerCase())) {
          const expr = this.parseExpression(buffer, 80);
          return { type: "unary", token: t, op: name, expression: expr };
        }

        // if (/^[a-fA-F0-9]+$/.test(t.value)) {
        //   return this.parseNumber(t);
        // }

        return { type: "identifier", token: t as IdentifierToken, name };
      case "open-paren": {
        const e = this.parseExpression(buffer, 0);
        buffer.expect("close-paren");
        return e;
      }

      case "increment": {
        const e = this.parseExpression(buffer, 0);

        return {
          type: "unary",
          token: t,
          op: "increment",
          expression: e,
        };
      }

      case "decrement": {
        const e = this.parseExpression(buffer, 0);

        return {
          type: "unary",
          token: t,
          op: "decrement",
          expression: e,
        };
      }

      case "pound":
        const op = t.type;
        const idTok = buffer.expect("identifier");

        return {
          type: "unary",
          token: t,
          op,
          expression: {
            type: "identifier",
            token: idTok,
            name: idTok.value,
          },
        };

      case "not":
      case "complement":
      case "minus": {
        const op = t.type;
        const expr = this.parseExpression(buffer, 80);
        return { type: "unary", token: t, op, expression: expr };
      }

      default:
        throw buffer.error(`Unexpected token in expression ${t.type}`);
    }
  }

  private ensureIdent(node: ASTNode, buffer: TokenBuffer): IdentifierASTNode {
    if (node.type !== "identifier") {
      throw buffer.error(`Expected identifier, got ${node.type}`);
    }

    return node;
  }

  private parseArgsList(buffer: TokenBuffer): ASTNode[] {
    const args: ASTNode[] = [];

    // empty argument list
    if (buffer.peek().type === "close-paren") {
      buffer.consume();
      return args;
    }

    // one or more arguments
    while (true) {
      const arg = this.parseExpression(buffer, 0);
      args.push(arg);

      if (buffer.peek().type === "comma") {
        buffer.consume();
        continue;
      } else if (buffer.peek().type === "close-paren") {
        buffer.consume();
        break;
      }

      throw buffer.error(
        `Unexpected token in argument list ${buffer.peek().type}, expected ',' or ')'`
      );
    }

    return args;
  }

  private parseDefineArgs(buffer: TokenBuffer): ASTNode[] {
    const args: ASTNode[] = [];

    // empty argument list
    if (buffer.peek().type === "eof") {
      buffer.consume();
      return args;
    }

    // one or more arguments
    while (true) {
      const arg = this.parseExpression(buffer, 0);
      args.push(arg);

      if (buffer.peek().type === "comma") {
        buffer.consume();
        continue;
      }

      break;
    }

    return args;
  }

  parseExpression(buffer: TokenBuffer, minBp = 0): ASTNode {
    let lhs = this.nud(buffer);

    while (true) {
      const pf = POSTFIX_BP[buffer.peek().type];

      if (pf !== undefined && pf >= minBp) {
        const opTok = buffer.peek();
        buffer.consume();

        lhs = {
          type: "postfix",
          token: opTok,
          op: opTok.type,
          expr: lhs,
        };
        continue;
      }

      if (buffer.peek().type === "open-paren") {
        const lparen = buffer.expect("open-paren");
        const args = this.parseArgsList(buffer);

        lhs = {
          type: "call",
          token: lparen,
          callee: this.ensureIdent(lhs, buffer),
          args,
        };
        continue;
      }

      const abp = ASSIGN_BP[buffer.peek().type];
      if (abp && abp[0] >= minBp) {
        const opTok = buffer.peek();
        buffer.consume();

        const rhs = this.parseExpression(buffer, abp[1]);
        lhs = {
          type: "assign",
          token: opTok,
          op: opTok.type,
          left: lhs,
          right: rhs,
        };
        continue;
      }

      const ibp = INFIX_BP[buffer.peek().type];
      if (ibp && ibp[0] >= minBp) {
        const opTok = buffer.peek();
        buffer.consume();

        const rhs = this.parseExpression(buffer, ibp[1]);
        lhs = {
          type: "binary",
          token: opTok,
          op: opTok.type,
          left: lhs,
          right: rhs,
        };
      } else {
        break;
      }
    }

    return lhs;
  }
}
