import { ASTNode, Parser, Program, ProgramLine, SourceLine } from "../parser";
import { TokenBuffer } from "../parser/TokenBuffer";
import { Tokenizer } from "../parser/tokenizer";

type NodeOf<T extends ASTNode["type"]> = Extract<ASTNode, { type: T }>;
type LineOf<T extends SourceLine["type"]> = Extract<SourceLine, { type: T }>;

export function isASTNode<T extends ASTNode["type"]>(
  node: ASTNode | null | undefined,
  kind: T
): node is NodeOf<T> {
  return node?.type === kind;
}

export function isSourceLine<T extends SourceLine["type"]>(
  line: SourceLine | null | undefined,
  kind: T
): line is LineOf<T> {
  return line?.type === kind;
}

export function findMneumonic(
  program: Program | undefined | null,
  mneumonic: string
): ProgramLine[] {
  if (!program) {
    return [];
  }

  return program.lines.filter(
    (line) =>
      line.type === "program" &&
      line.mneumonic?.toLowerCase() === mneumonic.toLowerCase()
  ) as ProgramLine[];
}

export function findAssignmentOperand(
  line: ProgramLine,
  arg: string
): ASTNode | null {
  for (let i = 0; i < (line.operands?.length || 0); i++) {
    const operand = line.operands![i];
    if (isASTNode(operand, "assign")) {
      const lhs = operand.left;
      if (isASTNode(lhs, "identifier") && lhs.name === arg) {
        return operand.right;
      }
    }
  }

  return null;
}

type WalkContext = {
  parents: ASTNode[];
  sourceLine: SourceLine | null;
};

function walkASTNode(
  node: ASTNode,
  matcher: (node: ASTNode) => boolean,
  callback: (node: ASTNode, parents: ASTNode[]) => void,
  parents: ASTNode[] = []
) {
  if (matcher(node)) {
    callback(node, parents.reverse());
  } else if (isASTNode(node, "binary")) {
    walkASTNode(node.left, matcher, callback, [...parents, node]);
    walkASTNode(node.right, matcher, callback, [...parents, node]);
  } else if (isASTNode(node, "unary")) {
    walkASTNode(node.expression, matcher, callback, [...parents, node]);
  } else if (isASTNode(node, "postfix")) {
    walkASTNode(node.expr, matcher, callback, [...parents, node]);
  } else if (isASTNode(node, "assign")) {
    walkASTNode(node.left, matcher, callback, [...parents, node]);
    walkASTNode(node.right, matcher, callback, [...parents, node]);
  } else if (isASTNode(node, "call")) {
    walkASTNode(node.callee, matcher, callback, [...parents, node]);
    for (const arg of node.args) {
      walkASTNode(arg, matcher, callback, [...parents, node]);
    }
  }
}

export function walkOperands<T extends ASTNode["type"]>(
  operands: ASTNode[],
  type: T,
  callback: (node: Extract<ASTNode, { type: T }>, context: WalkContext) => void
) {
  for (const operand of operands) {
    walkASTNode(
      operand,
      (node) => isASTNode(node, type),
      (node, parents) => {
        callback(node as Extract<ASTNode, { type: T }>, {
          parents,
          sourceLine: null,
        });
      }
    );
  }
}

export function walkSourceLineOperands<T extends ASTNode["type"]>(
  line: SourceLine,
  type: T,
  callback: (node: Extract<ASTNode, { type: T }>, context: WalkContext) => void
) {
  if (isSourceLine(line, "program")) {
    for (const operand of line.operands || []) {
      walkASTNode(
        operand,
        (node) => isASTNode(node, type),
        (node, parents) => {
          callback(node as Extract<ASTNode, { type: T }>, {
            parents,
            sourceLine: line,
          });
        }
      );
    }
  }
}

export function walkAllOperands<T extends ASTNode["type"]>(
  program: Program,
  type: T,
  callback: (node: Extract<ASTNode, { type: T }>, context: WalkContext) => void
) {
  for (const line of program.lines) {
    walkSourceLineOperands(line, type, callback);
  }
}

export function parseOperand(input: string): ASTNode {
  const parser = new Parser();
  return parser.parseExpression(new TokenBuffer(new Tokenizer(input)));
}

/**
 * Extract all the identifiers from a program. Identifiers will be any labels, or values that have been imported
 * using a GLOBAL
 */
export function extractAllAvailableVars(program: Program): string[] {
  const identifiers = new Set<string>();

  program.lines.forEach((line) => {
    if (isSourceLine(line, "program")) {
      if (line.label) {
        identifiers.add(line.label);
      }
    }
  });

  findMneumonic(program, "global").forEach((mneumonic) => {
    mneumonic.operands?.forEach((operand) => {
      if (isASTNode(operand, "identifier")) {
        identifiers.add(operand.name);
      }
    });
  });

  return Array.from(identifiers.values());
}
