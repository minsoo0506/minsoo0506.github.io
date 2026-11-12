import { expect, it } from 'vitest';
import { autoWire, emptyProgram, scanLadder, validateProgram } from '../ladder';
function reference() {
  const p = emptyProgram();
  p.cells[0][0] = { kind: 'no', address: 'M00000' };
  p.cells[0][5] = { kind: 'coil', address: 'M00010' };
  p.cells[1][0] = { kind: 'no', address: 'M00010' };
  p.cells[2][0] = { kind: 'no', address: 'M00010' };
  p.cells[2][5] = { kind: 'coil', address: 'P00020' };
  p.cells[3][5] = { kind: 'end', address: '' };
  p.branches = ['0:1'];
  return autoWire(p);
}
it('executes the reference in scan order and holds the red output after START release', () => {
  const p = reference();
  expect(validateProgram(p)).toBeNull();
  let s = scanLadder(p, {}, false);
  expect(s.P00020).toBe(false);
  s = scanLadder(p, s, true);
  expect(s.M00010).toBe(true);
  expect(s.P00020).toBe(true);
  s = scanLadder(p, s, false);
  expect(s.P00020).toBe(true);
  s = scanLadder(p, {}, false);
  expect(s.P00020).toBe(false);
});
it('does not latch without the parallel branch or energize across an open wire', () => {
  const p = reference();
  p.branches = [];
  let s = scanLadder(p, {}, true);
  expect(s.P00020).toBe(true);
  s = scanLadder(p, s, false);
  expect(s.P00020).toBe(false);
  p.cells[0][2] = null;
  expect(scanLadder(p, {}, true).P00020).toBe(false);
});
it('rejects ambiguous outputs and instructions after END', () => {
  const p = reference();
  p.cells[2][5] = { kind: 'coil', address: 'M00010' };
  expect(validateProgram(p)).toMatch(/one output coil/);
  p.cells[2][5] = { kind: 'coil', address: 'P00020' };
  p.cells[4][0] = { kind: 'wire', address: '' };
  expect(validateProgram(p)).toMatch(/above END/);
});
it('accepts the reference END row with a horizontal rail connection', () => {
  const p = reference();
  for (let col = 0; col < 5; col++) p.cells[3][col] = { kind: 'wire', address: '' };
  expect(validateProgram(p)).toBeNull();
  expect(scanLadder(p, {}, true).P00020).toBe(true);
});
it('rejects conditional END and duplicate END, even within the same row', () => {
  const p = reference();
  p.cells[3][0] = { kind: 'no', address: 'M00000' };
  expect(validateProgram(p)).toMatch(/END/);
  p.cells[3][0] = { kind: 'end', address: '' };
  expect(validateProgram(p)).toMatch(/one END/);
});
