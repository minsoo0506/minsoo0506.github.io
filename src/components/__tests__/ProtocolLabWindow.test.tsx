import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { ProtocolLabWindow } from '../windows/ProtocolLabWindow';
function wire(pairs: [string, string][]) {
  for (const [a, b] of pairs) {
    fireEvent.click(screen.getByRole('button', { name: `Source ${a}` }));
    fireEvent.click(screen.getByRole('button', { name: `Destination ${b}` }));
  }
}
it('opens RS-232 directly and resets the serial mission when switching interfaces', async () => {
  const user = userEvent.setup();
  render(<ProtocolLabWindow />);
  expect(screen.getByRole('heading', { name: 'RS-232 · Temperature Sensor' })).toBeInTheDocument();
  expect(screen.queryByRole('navigation', { name: 'Select mission' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /RS-485 Modbus/ }));
  expect(screen.getByRole('heading', { name: 'RS-485 · Inverter Control' })).toBeInTheDocument();
  expect(screen.queryByText('Modbus Lab')).not.toBeInTheDocument();
});
it('validates CAN wiring and settings and invalidates a previously successful result', async () => {
  const user = userEvent.setup();
  render(<ProtocolLabWindow />);
  await user.click(screen.getByRole('button', { name: /CAN Automotive/ }));
  await user.click(screen.getByRole('button', { name: /Transmit/ }));
  expect(screen.getByRole('status')).toHaveTextContent('Wiring fault');
  wire([
    ['CAN-H', 'CAN-H'],
    ['CAN-L', 'CAN-L'],
  ]);
  await user.selectOptions(screen.getByLabelText('Bit rate'), '250');
  await user.selectOptions(screen.getByLabelText('Termination'), 'both');
  await user.click(screen.getByRole('button', { name: /Transmit/ }));
  expect(screen.getByRole('status')).toHaveTextContent('Bit rate mismatch');
  await user.selectOptions(screen.getByLabelText('Bit rate'), '500');
  await user.click(screen.getByRole('button', { name: /Transmit/ }));
  expect(screen.getByRole('status')).toHaveTextContent('Success');
  expect(screen.getByText('1500 rpm · RX OK')).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Termination'), 'none');
  expect(screen.getByRole('status')).not.toHaveTextContent('Success');
  expect(screen.queryByText(/TRANSACTION #/)).not.toBeInTheDocument();
});
it.each([
  {
    name: 'UART',
    pairs: [
      ['TX', 'RX'],
      ['RX', 'TX'],
      ['GND', 'GND'],
    ],
    a: 'Baud rate',
    av: '115200',
    b: 'Frame format',
    bv: '8N1',
  },
  {
    name: 'SPI',
    pairs: [
      ['SCK', 'SCK'],
      ['MOSI', 'DI'],
      ['MISO', 'DO'],
      ['CS', 'CS'],
      ['GND', 'GND'],
    ],
    a: 'Clock mode',
    av: '0',
    b: 'Chip select',
    bv: 'low',
  },
  {
    name: 'I²C',
    pairs: [
      ['SDA', 'SDA'],
      ['SCL', 'SCL'],
      ['GND', 'GND'],
    ],
    a: 'Device address',
    av: '48',
    b: 'Pull-ups',
    bv: 'fitted',
  },
])(
  'completes the $name transaction after wiring the devices',
  async ({ name, pairs, a, av, b, bv }) => {
    const user = userEvent.setup();
    render(<ProtocolLabWindow />);
    await user.click(screen.getByRole('button', { name: new RegExp(`^${name} `) }));
    wire(pairs as [string, string][]);
    await user.selectOptions(screen.getByLabelText(a), av);
    await user.selectOptions(screen.getByLabelText(b), bv);
    await user.click(screen.getByRole('button', { name: /Transmit/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Success');
    expect(screen.getByRole('img', { name: `${name} timing diagram` })).toBeInTheDocument();
  }
);
