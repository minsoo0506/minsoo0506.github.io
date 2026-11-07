import { describe, it, expect } from 'vitest';
import { createTerminal, execute, restoreTerminal } from '../terminal';

describe('browser command prompt', () => {
  it('creates, reads, appends and deletes real virtual files across saved sessions', () => {
    let state = createTerminal();
    for (const line of [
      'mkdir "My Notes"',
      'cd "my notes"',
      'echo first > note.txt',
      'echo second >> note.txt',
    ]) {
      state = execute(state, line).state;
    }
    expect(execute(state, 'type NOTE.TXT').output).toBe('first\nsecond\n');
    state = restoreTerminal(JSON.stringify(state));
    expect(execute(state, 'dir').output).toContain('note.txt');
    state = execute(state, 'del note.txt').state;
    expect(execute(state, 'type note.txt').output).toContain('cannot find');
  });
  it('rejects missing parents, directory deletion as a file, and unsupported commands', () => {
    const state = createTerminal();
    expect(execute(state, 'echo x > missing\\file.txt').output).toContain('cannot find');
    expect(execute(state, 'del "My Documents"').output).toContain('Access is denied');
    expect(execute(state, 'ping example.com').output).toContain('not supported');
    expect(execute(state, 'unknown').output).toContain('not recognized');
    expect(execute(state, 'cd missing').state.cwd).toBe(state.cwd);
  });
  it('supports root navigation, screen clearing, exit, and recovers corrupt saved data', () => {
    const state = createTerminal();
    expect(execute(state, 'cd \\').state.cwd).toBe('c:\\');
    expect(execute(state, 'cls').clear).toBe(true);
    expect(execute(state, 'exit').exit).toBe(true);
    expect(restoreTerminal('{bad')).toEqual(createTerminal());
    expect(restoreTerminal('{"cwd":"missing","nodes":{}}')).toEqual(createTerminal());
  });
  it('provides portfolio commands and safe entertainment effects', () => {
    const state = createTerminal();
    expect(execute(state, 'about').output).toContain('Minsoo Park');
    expect(execute(state, 'skills').output).toContain('Embedded Systems');
    expect(execute(state, 'projects').output).toContain('ClassBridge');
    expect(execute(state, 'projects 1').openUrl).toBe(
      'https://github.com/minsoo0506/ClassBridge-BE'
    );
    expect(execute(state, 'projects 999').output).toContain('not found');
    expect(execute(state, 'contact').output).toContain('mspark010506@gmail.com');
    for (const cmd of ['coffee', 'joke', 'weather', 'sudo'])
      expect(execute(state, cmd).output).not.toBe('');
    for (const cmd of ['hack', 'bsod', 'countdown']) expect(execute(state, cmd).effect).toBe(cmd);
    expect(execute(state, 'help').output).toContain('PROJECTS');
  });
});
