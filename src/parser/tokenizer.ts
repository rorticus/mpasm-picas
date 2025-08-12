import { EOF, Token } from "./tokens";

const WHITESPACE = " \t\r\n";
const IDENTIFIER_START =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
const IDENTIFIER_CHAR =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
const NUMBER_START = "0123456789ABCDEF.";
const NUMBER_CHAR = "0123456789ABCDEF.";
const NUMBER_TYPE = "BDHOA";
const CHIP_CHAR = "abcdefghijklmnopqrstuvwxyz";

export class Tokenizer {
  index = 0;
  input = "";
  lineNum = 0;

  constructor(input: string, lineNum = 0) {
    this.index = 0;
    this.input = input;
    this.lineNum = lineNum;
  }

  private peek(offset = 0) {
    const i = this.index + offset;
    if (i < 0 || i >= this.input.length) {
      return EOF;
    }

    return this.input[i];
  }

  private eat() {
    const c = this.peek();
    this.index++;

    return c;
  }

  private isA(char: string, a: string) {
    if (a.includes(char)) {
      return true;
    }

    return false;
  }

  private parseComment(): Token {
    const start = this.index;

    // a comment is everything from this character to the end of the line
    this.index = this.input.length;

    return {
      type: "comment",
      value: this.input.slice(start),
      column: start,
      line: this.lineNum,
    };
  }

  private expect(expected: string): void {
    const c = this.peek();
    if (c !== expected) {
      throw new Error(
        `Expected '${expected}' but found '${c}' at line ${this.lineNum}, column ${this.index}`
      );
    }
    this.eat(); // consume the expected character
  }

  private parseIdentifier(): Token {
    const start = this.index;
    this.eat(); // consume the first character

    while (this.isA(this.peek(), IDENTIFIER_CHAR)) {
      this.eat(); // consume the rest of the identifier characters
    }

    const value = this.input.slice(start, this.index);

    return {
      type: "identifier",
      value,
      column: start,
      line: this.lineNum,
    };
  }

  private parseNumber(): Token {
    const start = this.index;

    if (this.isA(this.peek(), NUMBER_TYPE)) {
      const type = this.peek();

      this.eat(); // consume the 'B' or 'b'

      this.expect("'"); // expect a single quote for binary numbers

      if (type === "B") {
        while (this.isA(this.peek(), "01")) {
          this.eat();
        }
      } else if (type === "D") {
        while (this.isA(this.peek(), "0123456789")) {
          this.eat();
        }
      } else if (type === "H") {
        while (this.isA(this.peek(), "0123456789ABCDEF")) {
          this.eat();
        }
      } else if (type === "O") {
        while (this.isA(this.peek(), "01234567")) {
          this.eat();
        }
      } else if (type === "A") {
        // only one character
        this.eat();
      }

      this.expect("'"); // expect the closing single quote

      const value = this.input.slice(start, this.index);

      return {
        type: "number",
        value,
        column: start,
        line: this.lineNum,
      };
    } else {
      this.eat(); // consume the first character

      let isChip = false;

      while (
        this.isA(this.peek(), NUMBER_CHAR) ||
        this.isA(this.peek(), CHIP_CHAR)
      ) {
        if (this.isA(this.peek(), CHIP_CHAR)) {
          isChip = true;
        }

        this.eat(); // consume the rest of the number characters
      }

      const value = this.input.slice(start, this.index);

      if (value.length < 5 && value[0] != "1") {
        isChip = false;
      }

      return {
        type: isChip ? "chip-number" : "number",
        value,
        column: start,
        line: this.lineNum,
      };
    }
  }

  private singleCharToken<T extends Token["type"]>(
    type: T
  ): Extract<Token, { type: T }> {
    const start = this.index;
    const c = this.eat();

    return {
      type,
      value: c,
      column: start,
      line: this.lineNum,
    } as Extract<Token, { type: T }>;
  }

  private doubleCharToken<T extends Token["type"]>(
    type: T
  ): Extract<Token, { type: T }> {
    const start = this.index;
    const c1 = this.eat();
    const c2 = this.eat();

    return {
      type,
      value: c1 + c2,
      column: start,
      line: this.lineNum,
    } as Extract<Token, { type: T }>;
  }

  private tripleCharToken<T extends Token["type"]>(
    type: T
  ): Extract<Token, { type: T }> {
    const start = this.index;
    const c1 = this.eat();
    const c2 = this.eat();
    const c3 = this.eat();

    return {
      type,
      value: c1 + c2 + c3,
      column: start,
      line: this.lineNum,
    } as Extract<Token, { type: T }>;
  }

  private parseIncludePath(): Token {
    const start = this.index;
    this.eat(); // consume the '<'

    let value = "";
    while (this.peek() !== ">" && this.peek() !== EOF) {
      value += this.eat();
    }

    if (this.peek() !== ">") {
      throw new Error(
        `Expected '>' but found '${this.peek()}' at line ${
          this.lineNum
        }, column ${this.index}`
      );
    }
    this.eat(); // consume the '>'

    return {
      type: "include-path",
      value,
      column: start,
      line: this.lineNum,
    };
  }

  private parsePragma(): Token {
    const start = this.index;
    this.index = this.input.length;

    for (let i = start + 1; i < this.input.length; i++) {
      if (this.input[i] === ";") {
        this.index = i;
        break;
      }
    }

    return {
      type: "pragma",
      value: this.input.slice(start, this.index).trim(),
      column: start,
      line: this.lineNum,
    };
  }

  private parseString(): Token {
    const start = this.index;

    this.expect('"');
    while (this.peek() !== '"' && this.peek() !== EOF) {
      this.eat();
    }

    this.expect('"');

    return {
      type: "string",
      value: this.input.slice(start, this.index),
      column: start,
      line: this.lineNum,
    };
  }

  isFirstMeaningfulCharacter() {
    for (let j = this.index - 1; j >= 0; j--) {
      if (!this.isA(this.input[j], WHITESPACE)) {
        return false;
      }
    }

    return true;
  }

  next(): Token {
    // consume whitespace
    while (this.isA(this.peek(), WHITESPACE)) {
      this.eat();
    }

    const c = this.peek();

    // comment
    if (c === ";") {
      return this.parseComment();
    } else if (c === ",") {
      return this.singleCharToken("comma");
    } else if (c === "=") {
      if (this.peek(1) === "=") {
        return this.doubleCharToken("equal-to");
      }

      return this.singleCharToken("equals");
    } else if (c === ":") {
      return this.singleCharToken("colon");
    } else if (c === "+") {
      if (this.peek(1) === "=") {
        return this.doubleCharToken("plus-equals");
      } else if (this.peek(1) === "+") {
        return this.doubleCharToken("increment");
      }

      return this.singleCharToken("plus");
    } else if (c === "-") {
      if (this.peek(1) === "=") {
        return this.doubleCharToken("minus-equals");
      } else if (this.peek(1) === "-") {
        return this.doubleCharToken("decrement");
      }

      return this.singleCharToken("minus");
    } else if (c === "#") {
      // this is a pragma if there is only whitespace before it
      if (this.isFirstMeaningfulCharacter()) {
        return this.parsePragma();
      } else {
        return this.singleCharToken("pound");
      }
    } else if (c === "(") {
      return this.singleCharToken("open-paren");
    } else if (c === ")") {
      return this.singleCharToken("close-paren");
    } else if (c === '"') {
      return this.parseString();
    } else if (c === "<") {
      if (this.peek(1) === "<") {
        if (this.peek(2) === "=") {
          return this.tripleCharToken("left-shift-equals");
        }

        return this.doubleCharToken("left-shift");
      } else if (this.peek(1) === "=") {
        return this.doubleCharToken("less-than-equal");
      }

      return this.singleCharToken("less-than");
    } else if (c === ">") {
      if (this.peek(1) === ">") {
        if (this.peek(2) === "=") {
          return this.tripleCharToken("right-shift-equals");
        }

        return this.doubleCharToken("right-shift");
      } else if (this.peek(1) === "=") {
        return this.doubleCharToken("greater-than-equal");
      }

      return this.singleCharToken("greater-than");
    } else if (c === "'") {
      const start = this.index;
      this.eat(); // eat the '
      this.eat(); // eat the character
      this.expect("'");

      return {
        type: "number",
        value: this.input.slice(start, this.index),
        column: start,
        line: this.lineNum,
      };
    } else if (c === "!" && this.peek(1) === "=") {
      return this.doubleCharToken("not-equal-to");
    } else if (this.isA(c, IDENTIFIER_START)) {
      if (this.isA(c, NUMBER_TYPE)) {
        // this could be a number
        if (this.peek(1) === "'") {
          return this.parseNumber();
        }
      }

      return this.parseIdentifier();
    } else if (c === "*") {
      if (this.peek(1) === "=") {
        return this.doubleCharToken("multiply-equals");
      }

      return this.singleCharToken("multiply");
    } else if (c === "/") {
      if (this.peek(1) === "=") {
        return this.doubleCharToken("divide-equals");
      }
      return this.singleCharToken("divide");
    } else if (c === "~") {
      if (this.peek(1) === "=") {
        return this.doubleCharToken("xor-equals");
      }
      return this.singleCharToken("complement");
    } else if (c === "%") {
      if (this.peek(1) === "=") {
        return this.doubleCharToken("modulus-equals");
      }
      return this.singleCharToken("modulus");
    } else if (c === "$") {
      return this.singleCharToken("program-counter");
    } else if (this.isA(c, NUMBER_START)) {
      return this.parseNumber();
    } else if (c === EOF) {
      return {
        type: "eof",
        value: "",
        line: this.lineNum,
        column: this.index,
      };
    } else if (c === "&") {
      if (this.peek(1) === "&") {
        return this.doubleCharToken("logical-and");
      } else if (this.peek(1) === "=") {
        return this.doubleCharToken("and-equals");
      }

      return this.singleCharToken("boolean-and");
    } else if (c === "|") {
      if (this.peek(1) === "|") {
        return this.doubleCharToken("logical-or");
      } else if (this.peek(1) === "=") {
        return this.doubleCharToken("or-equals");
      }

      return this.singleCharToken("boolean-or");
    } else if (c === "^") {
      if (this.peek(1) === "=") {
        return this.doubleCharToken("xor-equals");
      }

      return this.singleCharToken("boolean-xor");
    } else {
      throw new Error(
        `Unexpected character '${c}' at line ${this.lineNum}, column ${this.index}`
      );
    }
  }
}
