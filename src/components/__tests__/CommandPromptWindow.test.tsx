import { render, screen, fireEvent } from '@testing-library/react';
import { it, expect, vi } from 'vitest';
import { CommandPromptWindow } from '../windows/CommandPromptWindow';

it('executes commands, recalls history, persists files and exits', () => {
  localStorage.clear();
  const close = vi.fn();
  const view = render(<CommandPromptWindow onClose={close} />);
  const run = (line: string) => {
    fireEvent.change(screen.getByRole('textbox'), { target: { value: line } });
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
  };
  run('echo saved > test.txt');
  run('type test.txt');
  expect(screen.getByRole('log')).toHaveTextContent('saved');
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowUp' });
  expect(screen.getByRole('textbox')).toHaveValue('type test.txt');
  run('cls');
  expect(screen.getByRole('log')).toBeEmptyDOMElement();
  view.unmount();
  render(<CommandPromptWindow onClose={close} />);
  run('type test.txt');
  expect(screen.getByRole('log')).toHaveTextContent('saved');
  run('exit');
  expect(close).toHaveBeenCalledOnce();
});
