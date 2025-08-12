import {
  ChipNumberToken,
  IdentifierToken,
  NumberToken,
  StringToken,
  Token,
} from "./tokens";

export type PragmaLine = {
  type: "pragma";
  pragma: string;
  value: string;
  comment?: string;
};

export type ProgramLine = {
  type: "program";
  label?: string;
  mneumonic?: string;
  operands?: ASTNode[];
  comment?: string;
};

export type DefineLine = {
  type: "define";
  name: string;
  operands?: ASTNode[];
};

export type SourceLine = PragmaLine | ProgramLine | DefineLine;

export type NumberASTNode = {
  type: "number";
  token: NumberToken;
  value: number;
  radix: 10 | 16 | 2 | 8; // Decimal, Hexadecimal, Binary, Octal
};

export type StringASTNode = {
  type: "string";
  token: StringToken;
  value: string;
};

export type CallASTNode = {
  type: "call";
  token: Token;
  callee: IdentifierASTNode;
  args: ASTNode[];
};

export type ChipNumberASTNode = {
  type: "chip-number";
  token: ChipNumberToken;
  value: string;
};

export type SymbolCurrentPCASTNode = {
  type: "pc";
};

export type IdentifierASTNode = {
  type: "identifier";
  token: IdentifierToken;
  name: string;
};

export type UnaryASTNode = {
  type: "unary";
  token: Token;
  op: string;
  expression: ASTNode;
};

export type PostfixASTNode = {
  type: "postfix";
  token: Token;
  op: string;
  expr: ASTNode;
};

export type BinaryASTNode = {
  type: "binary";
  token: Token;
  op: string;
  left: ASTNode;
  right: ASTNode;
};

export type AssignASTNode = {
  type: "assign";
  token: Token;
  op: string;
  left: ASTNode;
  right: ASTNode;
};

export type ASTNode =
  | NumberASTNode
  | StringASTNode
  | SymbolCurrentPCASTNode
  | IdentifierASTNode
  | UnaryASTNode
  | PostfixASTNode
  | BinaryASTNode
  | AssignASTNode
  | ChipNumberASTNode
  | CallASTNode;

export type Program = {
  lines: SourceLine[];
};
