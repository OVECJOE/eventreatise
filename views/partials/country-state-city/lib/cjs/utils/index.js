"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = exports.findStateByCodeAndCountryCode = exports.findEntryByCode = void 0;
const findEntryByCode = (source, code) => {
    if (code && source != null) {
        const codex = source.findIndex((c) => {
            return c.isoCode === code;
        });
        return codex !== -1 ? source[codex] : undefined;
    }
    return undefined;
};
exports.findEntryByCode = findEntryByCode;
const findStateByCodeAndCountryCode = (source, code, countryCode) => {
    if (code && countryCode && source != null) {
        const codex = source.findIndex((c) => {
            return c.isoCode === code && c.countryCode === countryCode;
        });
        return codex !== -1 ? source[codex] : undefined;
    }
    return undefined;
};
exports.findStateByCodeAndCountryCode = findStateByCodeAndCountryCode;
const compare = (a, b) => {
    if (a.name < b.name)
        return -1;
    if (a.name > b.name)
        return 1;
    return 0;
};
exports.compare = compare;
