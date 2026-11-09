import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect } from 'vitest';
import { FactoryControlWindow } from '../windows/FactoryControlWindow';

it('starts, pauses and resets the production line', async () => {
  const user = userEvent.setup();
  render(<FactoryControlWindow />);
  expect(screen.getByText(/ready to start/i)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /start line/i }));
  expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /pause/i }));
  expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /restart/i }));
  expect(screen.getByRole('button', { name: /start line/i })).toBeInTheDocument();
});
