export type BaseToken = {
  value: string;
  line: number;
  column: number;
};

export type CommentToken = BaseToken & {
  type: "comment";
};

export type EofToken = BaseToken & {
  type: "eof";
};

export type IdentifierToken = BaseToken & {
  type: "identifier";
};

export type NumberToken = BaseToken & {
  type: "number";
};

export type CommaToken = BaseToken & {
  type: "comma";
};

export type EqualsToken = BaseToken & {
  type: "equals";
};

export type ColonToken = BaseToken & {
  type: "colon";
};

export type PlusToken = BaseToken & {
  type: "plus";
};

export type PragmaToken = BaseToken & {
  type: "pragma";
};

export type IncludePathToken = BaseToken & {
  type: "include-path";
};

export type OpenParenToken = BaseToken & {
  type: "open-paren";
};

export type CloseParenToken = BaseToken & {
  type: "close-paren";
};

export type StringToken = BaseToken & {
  type: "string";
};

export type NotToken = BaseToken & {
  type: "not";
};

export type ProgramCounterToken = BaseToken & {
  type: "program-counter";
};

export type MinusToken = BaseToken & {
  type: "minus";
};

export type MultiplyToken = BaseToken & {
  type: "multiply";
};

export type DivideToken = BaseToken & {
  type: "divide";
};

export type ComplementToken = BaseToken & {
  type: "complement";
};

export type ModulusToken = BaseToken & {
  type: "modulus";
};

export type LeftShiftToken = BaseToken & {
  type: "left-shift";
};

export type RightShiftToken = BaseToken & {
  type: "right-shift";
};

export type GreaterThanOrEqualToken = BaseToken & {
  type: "greater-than-equal";
};

export type LessThanOrEqualToken = BaseToken & {
  type: "less-than-equal";
};

export type GreaterThanToken = BaseToken & {
  type: "greater-than";
};

export type LessThanToken = BaseToken & {
  type: "less-than";
};

export type EqualToToken = BaseToken & {
  type: "equal-to";
};

export type NotEqualToToken = BaseToken & {
  type: "not-equal-to";
};

export type BooleanAndToken = BaseToken & {
  type: "boolean-and";
};

export type BooleanOrToken = BaseToken & {
  type: "boolean-or";
};

export type BooleanXorToken = BaseToken & {
  type: "boolean-xor";
};

export type LogicalAndToken = BaseToken & {
  type: "logical-and";
};

export type LogicalOrToken = BaseToken & {
  type: "logical-or";
};

export type PlusEqualsToken = BaseToken & {
  type: "plus-equals";
};

export type MinusEqualsToken = BaseToken & {
  type: "minus-equals";
};

export type MultiplyEqualsToken = BaseToken & {
  type: "multiply-equals";
};

export type DivideEqualsToken = BaseToken & {
  type: "divide-equals";
};

export type ModulusEqualsToken = BaseToken & {
  type: "modulus-equals";
};

export type LeftShiftEqualsToken = BaseToken & {
  type: "left-shift-equals";
};

export type RightShiftEqualsToken = BaseToken & {
  type: "right-shift-equals";
};

export type AndEqualsToken = BaseToken & {
  type: "and-equals";
};

export type OrEqualsToken = BaseToken & {
  type: "or-equals";
};

export type XorEqualsToken = BaseToken & {
  type: "xor-equals";
};

export type IncrementToken = BaseToken & {
  type: "increment";
};

export type DecrementToken = BaseToken & {
  type: "decrement";
};

export type PoundToken = BaseToken & {
  type: "pound";
};

export type ChipNumberToken = BaseToken & {
  type: "chip-number";
};

export type Token =
  | CommentToken
  | EofToken
  | IdentifierToken
  | NumberToken
  | CommaToken
  | EqualsToken
  | ColonToken
  | PlusToken
  | PragmaToken
  | IncludePathToken
  | OpenParenToken
  | CloseParenToken
  | StringToken
  | NotToken
  | ProgramCounterToken
  | MinusToken
  | MultiplyToken
  | DivideToken
  | ComplementToken
  | ModulusToken
  | LeftShiftToken
  | RightShiftToken
  | GreaterThanOrEqualToken
  | LessThanOrEqualToken
  | GreaterThanToken
  | LessThanToken
  | EqualToToken
  | NotEqualToToken
  | BooleanAndToken
  | BooleanOrToken
  | BooleanXorToken
  | LogicalAndToken
  | LogicalOrToken
  | PlusEqualsToken
  | MinusEqualsToken
  | MultiplyEqualsToken
  | DivideEqualsToken
  | ModulusEqualsToken
  | LeftShiftEqualsToken
  | RightShiftEqualsToken
  | AndEqualsToken
  | OrEqualsToken
  | XorEqualsToken
  | IncrementToken
  | DecrementToken
  | PoundToken
  | ChipNumberToken;

export const EOF = "<eof>";
