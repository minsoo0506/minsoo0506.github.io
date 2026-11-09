import portfolio from '../data/portfolio.json';

type Node = { kind: 'directory' } | { kind: 'file'; text: string };
export type TerminalState = { cwd: string; nodes: Record<string, Node> };
type Result = {
  state: TerminalState;
  output: string;
  clear?: boolean;
  exit?: boolean;
  openUrl?: string;
  effect?: 'about' | 'hack' | 'bsod' | 'countdown';
};
export const TERMINAL_STORAGE = 'minsoo-command-prompt-v1';
const HOME = 'c:\\documents and settings\\minsoo';
const missing = 'The system cannot find the path specified.';
const funResponses = {
  coffee: [
    'Espresso deployed. Productivity is starting up.',
    'A fresh latte is ready. Foam status: excellent.',
    'Coffee level: restored. Bugs, beware.',
    'One cappuccino, with extra cloud storage.',
    'Pour-over complete. Take a moment to enjoy it.',
    'Iced coffee initialized. Stay cool out there.',
    'Your mocha is ready, with a chocolatey patch update.',
    'Americano loaded. The next idea is on its way.',
    'A warm cup of coffee appears. Save your work and sip.',
    'Refill successful. May your build be as strong as your coffee.',
  ],
  joke: [
    'Why do programmers prefer dark mode? Because light attracts bugs.',
    'It works on my machine. The machine has been promoted to production.',
    'A SQL query walks into a bar and asks: Can I join you?',
    'Why did the developer go broke? Because they used up all their cache.',
    'There are 10 kinds of people: those who understand binary and those who do not.',
    'Why was the JavaScript developer sad? They did not know how to null their feelings.',
    'A programmer puts two glasses on the nightstand: one full and one empty, just in case.',
    'Why did the computer visit the doctor? It had a virus.',
    'My code has no bugs. It just develops unexpected features.',
    'A byte walks into a bar looking a bit tired.',
  ],
  weather: [
    'Today: Cloudy with a chance of null pointers.',
    'Forecast: 99% chance of debugging.',
    'Sunny with occasional bursts of inspiration.',
    'Clear skies ahead, with a light breeze of fresh ideas.',
    'Scattered bugs this morning; patches expected by afternoon.',
    'A warm front of coffee is moving through the workspace.',
    'Partly cloudy, with a high chance of successful builds.',
    'Thunderstorms of inspiration may arrive without warning.',
    'A calm day, with a gentle stream of code.',
    'Forecast: bright ideas followed by scattered commits.',
  ],
};
type FunCommand = keyof typeof funResponses;
const remainingResponses: Partial<Record<FunCommand, string[]>> = {};
const lastResponse: Partial<Record<FunCommand, string>> = {};

function nextFunResponse(command: FunCommand) {
  let remaining = remainingResponses[command];
  if (!remaining?.length) remaining = [...funResponses[command]];
  const candidates = remaining.filter((response) => response !== lastResponse[command]);
  const choices = candidates.length ? candidates : remaining;
  const response = choices[Math.floor(Math.random() * choices.length)];
  remaining.splice(remaining.indexOf(response), 1);
  remainingResponses[command] = remaining;
  lastResponse[command] = response;
  return response;
}
const help = `Browser Command Prompt — files are stored in this browser only.

ABOUT / SKILLS / CONTACT   Portfolio information
PROJECTS [number]       List projects or open a project
COFFEE / JOKE / WEATHER   A little fun
HACK / BSOD / COUNTDOWN   Special effects
SUDO                    Try your luck

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
  if (cmd === 'about')
    return {
      ...result,
      output: `${portfolio.personal.fullname} — ${portfolio.personal.title}\n${portfolio.personal.location}\n\n${portfolio.personal.bio}`,
      effect: 'about',
    };
  if (cmd === 'skills')
    return respond(
      portfolio.skills.map((group) => `${group.category}: ${group.items.join(', ')}`).join('\n')
    );
  if (cmd === 'contact')
    return respond(
      `${portfolio.personal.email}\nGitHub: ${portfolio.social.github}\nInstagram: ${portfolio.social.instagram}`
    );
  if (cmd === 'projects') {
    if (!arg)
      return respond(
        portfolio.projects
          .map((project, index) => `${index + 1}. ${project.title}\n   ${project.description}`)
          .join('\n\n') + '\n\nType PROJECTS <number> to open a project.'
      );
    const index = /^\d+$/.test(arg.trim()) ? Number(arg.trim()) - 1 : -1;
    const project = portfolio.projects[index];
    return project
      ? { ...result, output: `Opening ${project.title}...`, openUrl: project.link }
      : respond('Project not found. Type PROJECTS for the list.');
  }
  if (cmd === 'coffee' || cmd === 'joke' || cmd === 'weather') {
    const response = nextFunResponse(cmd);
    return respond(
      cmd === 'coffee'
        ? `   ( (\n    ) )\n  ........\n  |      |]\n  \\______/\n${response}`
        : response
    );
  }
  if (cmd === 'sudo') return respond('Nice try. This is Windows XP.');
  if (cmd === 'hack' || cmd === 'bsod' || cmd === 'countdown') return { ...result, effect: cmd };
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
