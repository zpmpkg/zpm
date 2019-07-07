"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
function transformToInternalEntry(entry) {
    if (!lodash_1.has(entry, 'name') && lodash_1.has(entry, 'path')) {
        return entry;
    }
    const gdgsEntry = entry;
    if (lodash_1.has(entry, 'name') && gdgsEntry.repository && gdgsEntry.repository.startsWith('https://')) {
        const split = gdgsEntry.name.split('/');
        return {
            vendor: split[0],
            name: split[1],
            repository: gdgsEntry.repository,
            definition: gdgsEntry.definition,
        };
    }
    if (lodash_1.has(entry, 'name') && lodash_1.has(entry, 'definition')) {
        return entry;
    }
    if (!lodash_1.has(entry, 'name') && lodash_1.has(entry, 'path')) {
        return entry;
    }
    return entry;
}
exports.transformToInternalEntry = transformToInternalEntry;
//# sourceMappingURL=entry.js.map