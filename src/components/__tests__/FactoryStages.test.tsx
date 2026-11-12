import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { FactoryStagesWindow } from '../windows/FactoryStagesWindow';
function place(row: number, column: number, kind: string, address: string) {
  fireEvent.drop(
    screen.getByRole('button', { name: `Row ${row} column ${column}` }).parentElement!,
    { dataTransfer: { getData: () => JSON.stringify({ kind, address }) } }
  );
}
it('assembles the reference rungs with drag and drop and lights the tower lamp', () => {
  vi.useFakeTimers();
  try {
    render(<FactoryStagesWindow />);
    fireEvent.click(screen.getByRole('button', { name: /PLC Ladder/ }));
    fireEvent.click(screen.getByRole('button', { name: /Build & Run/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Build error');
    place(1, 1, 'no', 'M00000');
    place(1, 6, 'coil', 'M00010');
    place(2, 1, 'no', 'M00010');
    place(3, 1, 'no', 'M00010');
    place(3, 6, 'coil', 'P00020');
    place(4, 6, 'end', '');
    place(1, 1, 'branch', '');
    fireEvent.click(screen.getByRole('button', { name: 'Auto wire' }));
    fireEvent.click(screen.getByRole('button', { name: /Build & Run/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Press START' }));
    act(() => vi.advanceTimersByTime(60));
    expect(screen.getByRole('img', { name: 'Red tower lamp on' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Release START' }));
    act(() => vi.advanceTimersByTime(60));
    expect(screen.getByRole('img', { name: 'Red tower lamp on' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset PLC' }));
    act(() => vi.advanceTimersByTime(60));
    expect(screen.getByRole('img', { name: 'Red tower lamp off' })).toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});

it('advances the delayed thermal process and pauses without changing the value', () => {
  vi.useFakeTimers();
  try {
    render(<FactoryStagesWindow />);
    fireEvent.click(screen.getByRole('button', { name: /PID Temperature/ }));
    fireEvent.click(screen.getByRole('button', { name: /Start simulation/ }));
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText('PROCESS VALUE').parentElement).not.toHaveTextContent('25.0°C');
    fireEvent.click(screen.getByRole('button', { name: /Pause simulation/ }));
    const before = screen.getByText('PROCESS VALUE').parentElement?.textContent;
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('PROCESS VALUE').parentElement?.textContent).toBe(before);
  } finally {
    vi.useRealTimers();
  }
});
