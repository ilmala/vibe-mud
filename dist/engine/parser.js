"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCommand = parseCommand;
function parseCommand(input) {
    const parts = input.trim().toLowerCase().split(/\s+/);
    const cmd = parts[0] || '';
    const arg = parts.slice(1).join(' ');
    return { cmd, arg };
}
//# sourceMappingURL=parser.js.map