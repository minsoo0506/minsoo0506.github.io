import { useEffect, useRef, useState } from 'react';
import {
  createTerminal,
  displayPath,
  execute,
  restoreTerminal,
  TERMINAL_STORAGE,
} from '../../lib/terminal';
import './command-prompt.css';

const banner =
  'Microsoft Windows XP [Version 5.1.2600]\n(C) Copyright 1985-2001 Microsoft Corp.\n\nBrowser Command Prompt. Type HELP for commands.\n';

export function CommandPromptWindow({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState(() => {
    try {
      return restoreTerminal(localStorage.getItem(TERMINAL_STORAGE));
    } catch {
      return createTerminal();
    }
  });
  const [output, setOutput] = useState(banner);
  const [command, setCommand] = useState('');
  const history = useRef<string[]>([]);
  const historyIndex = useRef(0);
  const draft = useRef('');
  const input = useRef<HTMLInputElement>(null);
  const scroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    input.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [output]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = execute(state, command);
    let warning = '';
    if (result.state !== state) {
      try {
        localStorage.setItem(TERMINAL_STORAGE, JSON.stringify(result.state));
      } catch {
        warning = '\nStorage unavailable. Changes will last only while this window is open.';
      }
    }
    setState(result.state);
    setOutput((old) =>
      result.clear
        ? ''
        : `${old}\n${displayPath(state.cwd)}>${command}\n${result.output}${warning}\n`.slice(-60000)
    );
    if (command.trim()) history.current = [...history.current.slice(-99), command];
    historyIndex.current = history.current.length;
    setCommand('');
    if (result.exit) onClose();
  };

  return (
    <div
      className="command-prompt"
      ref={scroll}
      onClick={() => {
        if (!window.getSelection()?.toString()) input.current?.focus({ preventScroll: true });
      }}
    >
      <pre role="log" aria-label="Command output" aria-live="polite" aria-relevant="text">
        {output}
      </pre>
      <form onSubmit={submit} className="command-line">
        <label htmlFor="command-input">{displayPath(state.cwd)}&gt;</label>
        <input
          id="command-input"
          ref={input}
          value={command}
          aria-label="Command"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={4096}
          enterKeyHint="send"
          onChange={(event) => setCommand(event.target.value)}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
              event.preventDefault();
              if (historyIndex.current === history.current.length) draft.current = command;
              historyIndex.current = Math.max(
                0,
                Math.min(
                  history.current.length,
                  historyIndex.current + (event.key === 'ArrowUp' ? -1 : 1)
                )
              );
              setCommand(history.current[historyIndex.current] ?? draft.current);
            }
            if (
              event.ctrlKey &&
              event.key.toLowerCase() === 'c' &&
              !window.getSelection()?.toString()
            ) {
              event.preventDefault();
              setOutput((old) => `${old}\n${displayPath(state.cwd)}>${command}^C\n`);
              setCommand('');
            }
          }}
        />
      </form>
    </div>
  );
}
