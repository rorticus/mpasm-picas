# MPASM to PIC-AS Converter

A TypeScript-based tool that converts MPASM assembly projects to PIC-AS (XC8 assembler) format, automating the migration from the legacy MPASM assembler to Microchip's modern PIC-AS toolchain.

## Overview

MPASM was Microchip's legacy assembler for PIC microcontrollers that has been deprecated in favor of PIC-AS (part of the XC8 compiler suite). This tool automates the conversion process by parsing MPASM source files, applying various transformations to make them compatible with PIC-AS syntax and conventions, then generating the converted output files.

## Features

### Core Functionality
- **Complete project conversion**: Processes entire directories of MPASM files
- **Intelligent parsing**: Full AST-based parsing of MPASM assembly syntax
- **Comprehensive transformations**: Applies multiple transformation passes to ensure compatibility
- **File management**: Handles include files, maintains project structure

### Supported File Types
- `.asm` files (assembly source)
- `.inc` files (include files)
- Configurable file extensions via command line

## Installation

```bash
npm install
```

## Usage

### Basic Usage
```bash
npm start <input-directory> <output-directory>
```

### Command Line Options

- `--extensions` or `-e`: Specify file extensions to process (default: "asm,inc")
- `--map`: Path to register mapping file for bit instruction transformations
- `--inline-map` or `-m`: Inline register mappings (format: "old=new", can be specified multiple times)
- `--replacements`: Path to identifier replacement mapping file
- `--define` or `-d`: Define preprocessor macros (format: "name=value", can be specified multiple times)
- `--defines-file-name`: Name of the generated defines file (default: "defines.inc")

### Examples
```bash
# Convert a project with custom extensions and register mappings
npm start ./my-mpasm-project ./converted-project --extensions "asm,inc,s" --map register-map.txt

# With inline register mappings
npm start ./src ./dist --inline-map "ADCON0.ADGO=ADCON0bits.GO_nDONE" --inline-map "STATUS.C=STATUSbits.C"

# With custom defines
npm start ./input ./output --define "DEBUG=1" --define "VERSION=2" --defines-file-name "my-defines.inc"

# Complete example with multiple options
npm start ./mpasm-project ./pic-as-project \
  --extensions "asm,inc" \
  --define "FOSC=8000000" \
  --define "BAUDRATE=9600" \
  --inline-map "ADCON0.GO=ADCON0bits.GO_nDONE" \
  --defines-file-name "project-defines.inc"
```

## Transformations Applied

The converter applies the following transformations to ensure PIC-AS compatibility:

### 1. File Renaming (`rename-files`)
- Converts `.asm` files to `.s` extension (PIC-AS standard)

### 2. Include File Fixes (`fix-includes`)
- Converts angle bracket includes (`<file.inc>`) to quoted includes (`"file.inc"`)
- Fixes include file name casing to match actual files
- Replaces processor-specific includes (e.g., `"p16f1939.inc"`) with `<xc.inc>`

### 3. Number Format Conversion (`fix-numbers`)
- Hexadecimal: `H'FF'` → `0xFF`
- Binary: `B'11110000'` → `11110000B`
- Decimal: Numbers remain as-is
- Octal: `O'377'` → `377q`

### 4. External Declarations (`fix-externs`)
- Converts `EXTERN` declarations to `global` declarations for PIC-AS compatibility

### 5. Configuration Word Updates (`fix-configs`)
- Transforms `__CONFIG` directives from MPASM format to PIC-AS format
- Example: `__CONFIG _WDTE_OFF & _PWRTE_ON` → `config WDTE=OFF, PWRTE=ON`

### 6. Memory Section Fixes (`fix-psects`)
- Converts `UDATA` sections to `PSECT` format
- Converts `CODE` sections to `PSECT` format with appropriate class and delta parameters
- Example: `LABEL UDATA` → `PSECT LABEL, class=UDATA`

### 7. Resource Declarations (`fix-res`)
- Updates `res` (reserve memory) directives for PIC-AS syntax

### 8. Bit Instruction Mapping (`fix-bit-instructions`)
- Handles bit-oriented instructions (`bcf`, `bsf`, `btfsc`, `btfss`)
- Maps register.bit combinations using provided register mapping
- Adds comments showing original register.bit names

### 9. Fixed Address Handling (`fix-fixed-addresses`)
- Processes fixed memory address assignments

### 10. Identifier Replacement (`replace-identifiers`)
- Replaces identifiers based on provided replacement maps

### 11. Special Instruction Fixes
- **ADDFSR Fix** (`fix-addfsr`): Handles ADDFSR instruction transformations
- **ADDWFC Fix** (`fix-addwfc`): Processes ADDWFC instruction compatibility
- **Ifdef Fix** (`fix-ifdefs`): Updates conditional compilation directives

## File Structure

```
src/
├── index.ts                 # Main entry point and CLI handling
├── adapters/               # File I/O abstractions
│   ├── FileSystemInput.ts  # Input file adapter
│   ├── FileSystemOutput.ts # Output file adapter
│   └── types.ts           # Adapter type definitions
├── parser/                # MPASM syntax parser
│   ├── parser.ts         # Main parser implementation
│   ├── tokenizer.ts      # Lexical analysis
│   ├── tokens.ts         # Token definitions
│   └── types.ts          # Parser type definitions
├── transformations/       # Code transformation modules
│   ├── FixIncludes.ts    # Include file transformations
│   ├── FixNumbers.ts     # Number format conversions
│   ├── FixConfigs.ts     # Configuration word updates
│   └── ...               # Other transformation modules
├── unparser/             # AST to source code generation
│   └── unparser.ts      # Code generation from AST
└── utils/                # Utility functions
    └── ast.ts            # AST manipulation utilities
```

## Defines File Generation

The converter can generate a centralized defines file containing preprocessor macros that can be shared across your project. This is useful for:

- **Project constants**: Define common values like oscillator frequencies, baud rates, etc.
- **Configuration values**: Set up project-specific configuration constants
- **Version information**: Include version numbers and build information
- **Hardware abstractions**: Define pin mappings and hardware-specific values

### How It Works

1. **Define macros** using the `--define` option when running the converter
2. **Generated file** is automatically created with the specified name (default: `defines.inc`)
3. **Automatic inclusion** - the defines file is automatically included in all assembly files after the first `#include <...>` statement

### Example Generated Defines File

With the command:
```bash
npm start ./input ./output --define "FOSC=8000000" --define "DEBUG=1" --define "VERSION=2"
```

The generated `defines.inc` file will contain:
```assembly
#define FOSC 8000000
#define DEBUG 1
#define VERSION 2
```

And it will be automatically included in your assembly files:
```assembly
#include <xc.inc>           // Processor definitions
#include "defines.inc"       // Auto-generated defines
#include "other-file.inc"    // Your other includes
```

## Register Mapping Files

For bit instruction transformations, you can provide mapping files that specify how register.bit combinations should be converted:

```
# register-map.txt example
adcon0.adgo=ADCON0bits.GO_nDONE
status.c=STATUSbits.C
status.z=STATUSbits.Z
```

## Development

### Running Tests
```bash
npm test
```

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

## Architecture

The converter follows a pipeline architecture:

1. **Parse**: Input files are tokenized and parsed into an Abstract Syntax Tree (AST)
2. **Transform**: Multiple transformation passes modify the AST to apply PIC-AS compatibility changes
3. **Unparse**: The modified AST is converted back to source code with PIC-AS syntax
4. **Output**: Converted files are written to the output directory

## Limitations and Known Issues

- Some complex macro definitions may require manual review
- Advanced MPASM features not commonly used may not be fully supported
- Configuration word mappings may need adjustment for specific PIC models
- Complex conditional compilation may require manual verification

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Resources

- [MPASM to MPLAB XC8 PIC Assembler Migration Guide](https://www.circuitbread.com/tutorials/mpasm-to-mplab-xc8-pic-assembler)
- [Microchip Forum Discussion](https://forum.microchip.com/s/topic/a5C3l000000MdkPEAS/t382844)
- [PIC-AS Assembler Documentation](https://microchip.com/)

## License

ISC License - see package.json for details.
