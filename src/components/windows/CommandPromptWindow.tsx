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
  const [blueScreen, setBlueScreen] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopAnimation = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setBusy(false);
  };
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    []
  );
  useEffect(() => {
    if (!blueScreen) return;
    const dismiss = () => setBlueScreen(false);
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [blueScreen]);
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
    const prefix = `\n${displayPath(state.cwd)}>${command}\n`;
    if (result.effect === 'bsod') {
      setOutput((old) => `${old}${prefix}\n`.slice(-60000));
      setBlueScreen(true);
    } else if (result.effect === 'about') {
      setOutput((old) => `${old}${prefix}`.slice(-60000));
      setBusy(true);
      let offset = 0;
      timer.current = setInterval(() => {
        const chunk = result.output.slice(offset, offset + 4);
        offset += 4;
        setOutput((old) => `${old}${chunk}`.slice(-60000));
        if (offset >= result.output.length) {
          stopAnimation();
          setOutput((old) => `${old}\n`);
        }
      }, 25);
    } else if (result.effect === 'hack' || result.effect === 'countdown') {
      const lines =
        result.effect === 'hack'
          ? [
              'Connecting to mainframe...',
              'Bypassing firewall...',
              'Access granted. Secret found: I would also like to go home.',
            ]
          : ['3...', '2...', '1...', 'It is not time to go home yet.'];
      setOutput((old) => `${old}${prefix}`.slice(-60000));
      setBusy(true);
      let index = 0;
      timer.current = setInterval(() => {
        const line = lines[index++];
        setOutput((old) => `${old}${line}\n`.slice(-60000));
        if (index >= lines.length) stopAnimation();
      }, 650);
    } else {
      setOutput((old) =>
        result.clear ? '' : `${old}${prefix}${result.output}${warning}\n`.slice(-60000)
      );
    }
    if (result.openUrl) window.open(result.openUrl, '_blank', 'noopener,noreferrer');
    if (command.trim()) history.current = [...history.current.slice(-99), command];
    historyIndex.current = history.current.length;
    setCommand('');
    if (result.exit) onClose();
  };

  return (
    <>
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
            readOnly={busy}
            aria-label="Command"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={4096}
            enterKeyHint="send"
            onChange={(event) => setCommand(event.target.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing) return;
              if (
                busy &&
                (event.key === 'Escape' || (event.ctrlKey && event.key.toLowerCase() === 'c'))
              ) {
                event.preventDefault();
                stopAnimation();
                setOutput((old) => `${old}\n^C\n`);
                return;
              }
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
      {blueScreen && (
        <div
          className="xp-blue-screen"
          role="dialog"
          aria-modal="true"
          aria-label="Simulated blue screen"
          onClick={() => setBlueScreen(false)}
        >
          <p>
            A problem has been detected and Windows has been shut down to prevent damage to your
            computer.
          </p>
          <p>JUST_KIDDING_NO_COMPUTERS_WERE_HARMED</p>
          <p>Press any key or tap here to return to Command Prompt.</p>
          <button type="button" autoFocus onClick={() => setBlueScreen(false)}>
            Return
          </button>
        </div>
      )}
    </>
  );
}
