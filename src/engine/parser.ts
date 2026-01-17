export interface Command {
  cmd: string;
  arg: string;
}

export function parseCommand(input: string): Command {
  const parts = input.trim().toLowerCase().split(/\s+/);
  const cmd = parts[0] || '';
  const arg = parts.slice(1).join(' ');

  return { cmd, arg };
}
