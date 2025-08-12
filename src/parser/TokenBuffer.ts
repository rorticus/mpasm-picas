import { Tokenizer } from "./tokenizer";
import { Token } from "./tokens";

export class TokenBuffer {
  private tokens: Token[] = [];
  private currentIndex = 0;
  private tokenizer: Tokenizer;

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;

    while (true) {
      const token = tokenizer.next();
      if (token.type === "eof") {
        break;
      }
      this.tokens.push(token);
    }
  }

  peek(offset = 0) {
    return (
      this.tokens[this.currentIndex + offset] || {
        type: "eof",
        value: "",
        line: 0,
        column: 0,
      }
    );
  }

  expect<T extends Token["type"]>(
    type: T
  ): Extract<Token, { type: T }> & Token {
    const token = this.peek();

    if (token.type !== type) {
      throw new Error(
        `Expected token of type '${type}' but found '${token.type}' at line ${token.line}, column ${token.column}`
      );
    }

    this.consume();

    return token as Extract<Token, { type: T }> & Token;
  }

  consume() {
    this.currentIndex++;
  }

  tokenIndex() {
    return this.currentIndex;
  }

  error(message: string) {
    const token = this.peek();

    const lines = [
      "",
      this.tokenizer.input,
      " ".repeat(token.column) + "^",
      `Line: ${this.tokenizer.lineNum + 1}, Column: ${token.column + 1}`,
      "",
      message,
    ];

    return new Error(lines.join("\n"));
  }
}
