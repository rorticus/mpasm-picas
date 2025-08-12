import { ASTNode, Program, SourceLine } from "../parser";
import { isASTNode, isSourceLine } from "../utils/ast";

type FormatOptions = {
  maxLabelLength: number;
  forceLabelColons: boolean;
};

/**
 * Certain mneumonics shouldn't get colons after their labels
 */
const MNEUMONICS_WITH_IDENTIFIERS = ["macro", "equ", "udata", "code"];

export class Unparser {
  indentation = 4;
  commentSymbol = ";";
  forceLabelColons = false;

  constructor(options: {
    indent?: number;
    commentSymbol?: string;
    forceLabelColons?: boolean;
  }) {
    if (options.indent) {
      this.indentation = options.indent;
    }
    if (options.commentSymbol) {
      this.commentSymbol = options.commentSymbol;
    }
    if (options.forceLabelColons) {
      this.forceLabelColons = options.forceLabelColons;
    }
  }

  private buildLabel(label: string | undefined, format: FormatOptions) {
    if (!label) {
      return " ".repeat(format.maxLabelLength);
    }

    return (format.forceLabelColons ? `${label}:` : label).padEnd(
      format.maxLabelLength -
        (this.forceLabelColons && !format.forceLabelColons ? 1 : 0)
    );
  }

  private buildComment(comment: string | undefined) {
    return !comment ? "" : `${this.commentSymbol} ${comment}`;
  }

  private buildLine(parts: (string | null | undefined)[]) {
    return parts.filter(Boolean).join(" ");
  }

  unparseProgram(program: Program): string {
    // find the largest label
    const programLines = program.lines.filter((line) =>
      isSourceLine(line, "program")
    );
    const labels = programLines
      .map((line) => line.label)
      .filter(Boolean) as string[];

    let longestLabel = "";
    labels.forEach((label) => {
      if (label.length > longestLabel.length) {
        longestLabel = label;
      }
    });

    const labelLength = Math.max(
      this.indentation,
      longestLabel.length + (this.forceLabelColons ? 1 : 0)
    );

    return program.lines
      .map((line) =>
        this.unparseLine(line, {
          maxLabelLength: labelLength,
          forceLabelColons: this.forceLabelColons,
        })
      )
      .join("\n");
  }

  unparseLine(sourceLine: SourceLine, format: FormatOptions): string {
    if (isSourceLine(sourceLine, "pragma")) {
      return this.buildLine([
        sourceLine.pragma,
        sourceLine.value,
        this.buildComment(sourceLine.comment),
      ]);
    } else if (isSourceLine(sourceLine, "define")) {
      return this.buildLine([
        "#define",
        sourceLine.name,
        sourceLine.operands?.map((op) => this.unparseOperand(op)).join(", "),
      ]);
    } else {
      let needsColon = format.forceLabelColons;

      if (
        sourceLine.mneumonic &&
        MNEUMONICS_WITH_IDENTIFIERS.includes(sourceLine.mneumonic.toLowerCase())
      ) {
        needsColon = false;
      }
      return (
        (sourceLine.label ? "\n" : "") +
        this.buildLine([
          this.buildLabel(sourceLine.label, {
            ...format,
            forceLabelColons: needsColon,
          }),
          sourceLine.mneumonic,
          sourceLine.operands
            ?.map((operand) => this.unparseOperand(operand))
            .join(", "),
          this.buildComment(sourceLine.comment),
        ])
      );
    }
  }

  private unparseOperand(operand: ASTNode): string {
    if (isASTNode(operand, "number")) {
      return operand.token.value;
    } else if (isASTNode(operand, "string")) {
      if (operand.value.length > 1) {
        return `"${operand.value}"`;
      } else {
        return `'${operand.value}'`;
      }
    } else if (isASTNode(operand, "chip-number")) {
      return operand.value;
    } else if (isASTNode(operand, "identifier")) {
      return operand.name;
    } else if (isASTNode(operand, "binary")) {
      return `${this.unparseOperand(operand.left)} ${operand.token.value} ${this.unparseOperand(operand.right)}`;
    } else if (isASTNode(operand, "unary")) {
      if (operand.token.value.length === 1) {
        return `${operand.token.value}${this.unparseOperand(operand.expression)}`;
      } else {
        return `${operand.token.value} ${this.unparseOperand(operand.expression)}`;
      }
    } else if (isASTNode(operand, "postfix")) {
      return `${this.unparseOperand(operand.expr)}${operand.token.value}`;
    } else if (isASTNode(operand, "assign")) {
      return `${this.unparseOperand(operand.left)}${operand.token.value}${this.unparseOperand(operand.right)}`;
    } else if (isASTNode(operand, "call")) {
      return `${operand.callee.name}(${operand.args.map((arg) => this.unparseOperand(arg)).join(", ")})`;
    } else if (isASTNode(operand, "pc")) {
      return "$";
    }

    return "";
  }
}
