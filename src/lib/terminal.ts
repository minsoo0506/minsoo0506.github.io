import portfolio from '../data/portfolio.json';

type Node = { kind: 'directory' } | { kind: 'file'; text: string };
export type TerminalState = { cwd: string; nodes: Record<string, Node> };
type Result = { state: TerminalState; output: string; clear?: boolean; exit?: boolean };
export const TERMINAL_STORAGE = 'minsoo-command-prompt-v1';
const HOME = 'c:\\documents and settings\\minsoo';
const missing = 'The system cannot find the path specified.';
const help = `Browser Command Prompt — files are stored in this browser only.

DIR [path]              List files and folders
CD [path]              Change directory (CD .. goes back)
TYPE <file>            Read a text file
MKDIR <folder>         Create a folder (MD also works)
ECHO <text>            Print text
ECHO <text> > <file>   Write a file (>> appends)
DEL <file>             Delete a file
RMDIR <folder>         Remove an empty folder (RD also works)
CLS                    Clear the screen
VER / WHOAMI           Version / current user
DATE / TIME            Show local date / time
HELP                   Show this help
EXIT                   Close Command Prompt

Use quotes around paths containing spaces. Up/Down recalls commands.
This is a browser filesystem, not Windows cmd.exe.
Native programs, network commands, pipes and batch scripts are unavailable.`;

export function createTerminal(): TerminalState {
  return {
    cwd: HOME,
    nodes: {
      'c:\\': { kind: 'directory' },
      'c:\\documents and settings': { kind: 'directory' },
      [HOME]: { kind: 'directory' },
      [`${HOME}\\my documents`]: { kind: 'directory' },
      [`${HOME}\\readme.txt`]: { kind: 'file', text: `${help}\n` },
      [`${HOME}\\about.txt`]: {
        kind: 'file',
        text: `${portfolio.personal.fullname}\n${portfolio.personal.title}\n\n${portfolio.personal.bio}\n`,
      },
      [`${HOME}\\contact.txt`]: {
        kind: 'file',
        text: `${portfolio.personal.email}\n${portfolio.personal.instagram}\n`,
      },
    },
  };
}

export function restoreTerminal(saved: string | null): TerminalState {
  try {
    const value = JSON.parse(saved ?? 'null');
    if (
      !value ||
      typeof value.cwd !== 'string' ||
      !value.nodes ||
      typeof value.nodes !== 'object' ||
      Array.isArray(value.nodes)
    )
      return createTerminal();
    const entries = Object.entries(value.nodes);
    if (
      entries.length > 1000 ||
      !entries.every(([path, node]) => {
        const n = node as Node | null;
        return (
          /^c:\\/.test(path) &&
          n &&
          (n.kind === 'directory' || (n.kind === 'file' && typeof n.text === 'string'))
        );
      }) ||
      value.nodes[value.cwd]?.kind !== 'directory' ||
      value.nodes['c:\\']?.kind !== 'directory'
    )
      return createTerminal();
    return { cwd: value.cwd, nodes: value.nodes };
  } catch {
    return createTerminal();
  }
}

function resolve(cwd: string, input: string) {
  const raw = input
    .trim()
    .replace(/^"(.*)"$/, '$1')
    .replace(/\//g, '\\')
    .toLowerCase();
  if (/^[a-z]:/.test(raw) && !raw.startsWith('c:')) return null;
  if (/[<>|?*":]/.test(raw.replace(/^c:/, ''))) return null;
  const full = raw.startsWith('c:\\')
    ? raw.slice(3)
    : raw.startsWith('\\')
    ? raw.slice(1)
    : `${cwd.slice(3)}\\${raw}`;
  const parts: string[] = [];
  for (const part of full.split('\\')) {
    if (part === '..') parts.pop();
    else if (part && part !== '.') parts.push(part);
  }
  return `c:\\${parts.join('\\')}`;
}
const parent = (path: string) => path.slice(0, path.lastIndexOf('\\')) || 'c:';
const parentPath = (path: string) => (parent(path) === 'c:' ? 'c:\\' : parent(path));
export const displayPath = (path: string) =>
  path.replace(/^c:/, 'C:').replace('documents and settings', 'Documents and Settings');

export function execute(current: TerminalState, line: string): Result {
  const result: Result = { state: current, output: '' };
  const match = line.trim().match(/^(\S+)(?:\s+([\s\S]*))?$/);
  if (!match) return result;
  const cmd = match[1].toLowerCase();
  const arg = match[2] ?? '';
  const path = resolve(current.cwd, arg);
  const node = path ? current.nodes[path] : undefined;
  const respond = (output: string) => ({ ...result, output });
  const write = (target: string, entry?: Node) => {
    const nodes = { ...current.nodes };
    if (entry) nodes[target] = entry;
    else delete nodes[target];
    if (Object.keys(nodes).length > 1000 || JSON.stringify(nodes).length > 1_000_000)
      return respond('Browser disk quota exceeded. Delete some files first.');
    return { ...result, state: { ...current, nodes } };
  };
  if (cmd === 'help' || arg === '/?') return respond(help);
  if (cmd === 'cls') return { ...result, clear: true };
  if (cmd === 'exit') return { ...result, exit: true };
  if (cmd === 'ver')
    return respond('Microsoft Windows XP [Version 5.1.2600]\nBrowser Command Prompt');
  if (cmd === 'whoami') return respond('minsoo');
  if (cmd === 'date') return respond(new Date().toLocaleDateString());
  if (cmd === 'time') return respond(new Date().toLocaleTimeString());
  if (cmd === 'cd' || cmd === 'chdir' || cmd === 'cd..') {
    if (!arg && cmd !== 'cd..') return respond(displayPath(current.cwd));
    const target = cmd === 'cd..' ? resolve(current.cwd, '..') : path;
    return target && current.nodes[target]?.kind === 'directory'
      ? { ...result, state: { ...current, cwd: target } }
      : respond(missing);
  }
  if (cmd === 'dir') {
    if (!path || !node) return respond(missing);
    const entries =
      node.kind === 'file'
        ? [[path, node] as const]
        : Object.entries(current.nodes).filter(([key]) => key !== path && parentPath(key) === path);
    return respond(
      ` Volume in drive C is BROWSER\n\n Directory of ${displayPath(path)}\n\n${entries
        .map(
          ([key, value]) =>
            `${
              value.kind === 'directory' ? '       <DIR>' : String(value.text.length).padStart(12)
            }  ${key.split('\\').pop()}`
        )
        .join('\n')}\n\n ${entries.length} item(s)`
    );
  }
  if (cmd === 'type') return respond(node?.kind === 'file' ? node.text : missing);
  if (cmd === 'mkdir' || cmd === 'md') {
    if (!arg || !path) return respond('The syntax of the command is incorrect.');
    if (node) return respond('A file or directory already exists.');
    return current.nodes[parentPath(path)]?.kind === 'directory'
      ? write(path, { kind: 'directory' })
      : respond(missing);
  }
  if (cmd === 'echo') {
    const redirect = arg.match(/^([\s\S]*?)\s*(>>?)\s*(.+)$/);
    if (!redirect) return respond(arg || 'ECHO is on.');
    const target = resolve(current.cwd, redirect[3]);
    if (!target || current.nodes[parentPath(target)]?.kind !== 'directory') return respond(missing);
    const old = current.nodes[target];
    if (old?.kind === 'directory') return respond('Access is denied.');
    return write(target, {
      kind: 'file',
      text: `${redirect[2] === '>>' && old?.kind === 'file' ? old.text : ''}${redirect[1]}\n`,
    });
  }
  if (cmd === 'del' || cmd === 'erase') {
    if (!arg || !path || !node) return respond(missing);
    return node.kind === 'file'
      ? write(path)
      : respond('Access is denied. Use RMDIR for empty folders.');
  }
  if (cmd === 'rmdir' || cmd === 'rd') {
    if (!arg || !path || node?.kind !== 'directory') return respond(missing);
    if (path === 'c:\\' || current.cwd === path || current.cwd.startsWith(`${path}\\`))
      return respond('Access is denied.');
    if (Object.keys(current.nodes).some((key) => key !== path && parentPath(key) === path))
      return respond('The directory is not empty.');
    return write(path);
  }
  if (['ping', 'ipconfig', 'ssh', 'curl', 'python', 'node', 'cmd', 'powershell'].includes(cmd))
    return respond(
      `${cmd} is not supported in this browser terminal. Type HELP for available commands.`
    );
  return respond(
    `'${match[1]}' is not recognized as an internal or external command,\noperable program or batch file. Type HELP for available commands.`
  );
}
