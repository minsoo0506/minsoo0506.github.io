import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect } from 'vitest';
import { GpioLabWindow } from '../windows/GpioLabWindow';

it('wires by selecting two terminals, rejects unsafe voltage, then tests the relay and input', async () => {
  const user = userEvent.setup();
  render(<GpioLabWindow />);
  await user.click(screen.getByRole('button', { name: 'PA5 terminal' }));
  await user.click(screen.getByRole('button', { name: '+12V terminal' }));
  await user.click(screen.getByRole('button', { name: 'PB3 terminal' }));
  await user.click(screen.getByRole('button', { name: 'J2 terminal' }));
  await user.click(screen.getByRole('button', { name: /verify wiring/i }));
  expect(screen.getByRole('status')).toHaveTextContent(/12 v/i);
  expect(screen.getByRole('button', { name: /drive high/i })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'PA5 terminal' }));
  await user.click(screen.getByRole('button', { name: 'J1 terminal' }));
  await user.click(screen.getByRole('button', { name: /verify wiring/i }));
  expect(screen.getByRole('status')).toHaveTextContent(/wiring verified/i);
  await user.selectOptions(screen.getByLabelText('PA5 mode'), 'output');
  await user.selectOptions(screen.getByLabelText('PB3 mode'), 'input');
  await user.click(screen.getByRole('button', { name: /drive high/i }));
  expect(screen.getByLabelText('Relay energized')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /close level switch/i }));
  expect(screen.getByText(/PB3 reads:/i)).toHaveTextContent(/low/i);
  await user.click(screen.getByRole('button', { name: /drive low/i }));
  await user.click(screen.getByRole('button', { name: /check mission/i }));
  expect(screen.getByRole('status')).toHaveTextContent(/complete/i);
});
