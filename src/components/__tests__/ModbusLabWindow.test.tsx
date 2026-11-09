import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ModbusLabWindow } from '../windows/ModbusLabWindow';

async function configure(user: ReturnType<typeof userEvent.setup>, address = '1') {
  await user.selectOptions(screen.getByLabelText('Baud rate'), '9600');
  await user.selectOptions(screen.getByLabelText('Parity'), 'even');
  await user.selectOptions(screen.getByLabelText('Stop bits'), '1');
  await user.selectOptions(screen.getByLabelText('Device address'), address);
  if (address === '2') await user.selectOptions(screen.getByLabelText('Inverter command'), 'read');
  await user.selectOptions(screen.getByLabelText('Register'), '0');
  await user.selectOptions(screen.getByLabelText('Request CRC'), 'valid');
}

describe('Modbus Lab', () => {
  it('requires explicit settings and correct RS-232 pin mapping, then shows the transmitted byte waveform', async () => {
    const user = userEvent.setup();
    render(<ModbusLabWindow />);
    await user.click(screen.getByRole('button', { name: /start mission 1/i }));
    expect(screen.getByText('Temperature Sensor')).toBeInTheDocument();
    expect(screen.getByLabelText('Baud rate')).toHaveValue('');
    await user.click(screen.getByRole('button', { name: /send request/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/select/i);
    expect(screen.getByRole('alertdialog')).toHaveTextContent(/select/i);
    await user.click(screen.getByRole('button', { name: /close hint/i }));
    await configure(user);
    await user.selectOptions(screen.getByLabelText('Controller TX connection'), 'TX');
    await user.selectOptions(screen.getByLabelText('Controller RX connection'), 'RX');
    await user.selectOptions(screen.getByLabelText('Controller GND connection'), 'GND');
    await user.click(screen.getByRole('button', { name: /send request/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/connection/i);
    await user.click(screen.getByRole('button', { name: /close hint/i }));
    await user.selectOptions(screen.getByLabelText('Controller TX connection'), 'RX');
    await user.selectOptions(screen.getByLabelText('Controller RX connection'), 'TX');
    await user.click(screen.getByRole('button', { name: /send request/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/23.5/);
    expect(screen.getByText(/01 03 02 00 EB F8 0B/)).toBeInTheDocument();
    expect(screen.getByLabelText(/UART waveform/i)).toBeInTheDocument();
    expect(screen.getByText(/LSB first/i)).toBeInTheDocument();
  });

  it('uses only A and B for RS-485 and rejects swapped connections', async () => {
    const user = userEvent.setup();
    render(<ModbusLabWindow />);
    await user.click(screen.getByRole('button', { name: /start mission 2/i }));
    expect(screen.getByText(/IVT · DEVICE 02/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /fan stopped/i })).toBeInTheDocument();
    await configure(user, '2');
    expect(screen.queryByLabelText('Controller GND connection')).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Controller TRX+ connection'), 'TRX-');
    await user.selectOptions(screen.getByLabelText('Controller TRX- connection'), 'TRX+');
    await user.click(screen.getByRole('button', { name: /send request/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/connection/i);
    await user.click(screen.getByRole('button', { name: /close hint/i }));
    await user.selectOptions(screen.getByLabelText('Controller TRX+ connection'), 'TRX+');
    await user.selectOptions(screen.getByLabelText('Controller TRX- connection'), 'TRX-');
    await user.click(screen.getByRole('button', { name: /send request/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/0 rpm/i);
    expect(screen.getByText(/RS-485 uses a differential/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Register'), '99');
    await user.click(screen.getByRole('button', { name: /send request/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/illegal data address/i);
    expect(screen.getByText(/exception code/i)).toBeInTheDocument();
  });

  it('starts and stops the simulated inverter using echoed function 05 coil writes', async () => {
    const user = userEvent.setup();
    render(<ModbusLabWindow />);
    await user.click(screen.getByRole('button', { name: /start mission 2/i }));
    expect(screen.getByRole('img', { name: /fan stopped/i })).toBeInTheDocument();
    await configure(user, '2');
    await user.selectOptions(screen.getByLabelText('Controller TRX+ connection'), 'TRX+');
    await user.selectOptions(screen.getByLabelText('Controller TRX- connection'), 'TRX-');
    await user.selectOptions(screen.getByLabelText('Inverter command'), 'run');
    await user.selectOptions(screen.getByLabelText('Parity'), 'none');
    await user.click(screen.getByRole('button', { name: /send request/i }));
    expect(screen.getByRole('img', { name: /fan stopped/i })).toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toHaveTextContent(/framing/i);
    await user.click(screen.getByRole('button', { name: /close hint/i }));
    await user.selectOptions(screen.getByLabelText('Parity'), 'even');
    await user.click(screen.getByRole('button', { name: /send request/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/running/i);
    expect(screen.getByRole('img', { name: /fan running/i })).toBeInTheDocument();
    expect(screen.getAllByText(/02 05 00 00 FF 00 8C 09/)).toHaveLength(3);
    await user.selectOptions(screen.getByLabelText('Inverter command'), 'stop');
    await user.click(screen.getByRole('button', { name: /send request/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/stopped/i);
    expect(screen.getByRole('img', { name: /fan stopped/i })).toBeInTheDocument();
    expect(screen.getAllByText(/02 05 00 00 00 00/)).toHaveLength(2);
  });
});
