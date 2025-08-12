import { fixADDFSR } from "./fixADDFSR";
import { fixAddwfc } from "./fixAddwfc";
import { fixBitInstructions } from "./fixBitInstructions";
import { fixConfigs } from "./fixConfigs";
import { fixExterns } from "./fixExterns";
import { fixFixedAddresses } from "./fixFixedAddresses";
import { fixIfdefs } from "./fixIfdefs";
import { fixIncludes } from "./fixIncludes";
import { fixNumbers } from "./fixNumbers";
import { fixPSECTs } from "./fixPSECTS";
import { fixRes } from "./fixRes";
import { renameFiles } from "./renameFiles";
import { replaceIdentifiers } from "./replaceIdentifiers";
import { FileTransformer, TransformerContext } from "./types";

export const transformers: Record<
  string,
  FileTransformer<TransformerContext>
> = {
  "rename-files": renameFiles,
  "fix-includes": fixIncludes,
  "fix-numbers": fixNumbers,
  "fix-externs": fixExterns,
  "fix-configs": fixConfigs,
  "fix-psects": fixPSECTs,
  "fix-res": fixRes,
  "fix-bit-instructions": fixBitInstructions,
  "fix-fixed-addresses": fixFixedAddresses,
  "replace-identifiers": replaceIdentifiers,
  "fix-addfsr": fixADDFSR,
  "fix-ifdefs": fixIfdefs,
  "fix-addwfc": fixAddwfc,
};
