"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageTypeToInternalType = {
    ["GDGS" /* GDGS */]: "GDGS" /* GDGS */,
    ["PDPS" /* PDPS */]: "PDPS" /* PDPS */,
    ["PDGS" /* PDGS */]: "PDGS" /* PDGS */,
    ["GDPS" /* GDPS */]: "GDPS" /* GDPS */,
    ["GSSub" /* GSSub */]: "GSSub" /* GSSub */,
    ["PSSub" /* PSSub */]: "PSSub" /* PSSub */,
};
exports.isInternalDefinitionEntry = (condition) => (entry) => entry.internalDefinitionType === condition;
exports.isInternalGDGS = exports.isInternalDefinitionEntry("GDGS" /* GDGS */);
exports.isInternalPDPS = exports.isInternalDefinitionEntry("PDPS" /* PDPS */);
exports.isInternalPDGS = exports.isInternalDefinitionEntry("PDGS" /* PDGS */);
exports.isInternalGDPS = exports.isInternalDefinitionEntry("GDPS" /* GDPS */);
exports.isInternalGSSub = exports.isInternalDefinitionEntry("GSSub" /* GSSub */);
exports.isInternalPSSub = exports.isInternalDefinitionEntry("PSSub" /* PSSub */);
//# sourceMappingURL=entryType.js.map