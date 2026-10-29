import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingScreen from '../LoadingScreen';

describe('LoadingScreen', () => {
  it('announces startup while showing the Windows XP boot screen', () => {
    render(<LoadingScreen />);
    expect(screen.getByRole('status')).toHaveAccessibleName('Starting Windows XP');
    expect(screen.getByAltText('Microsoft Windows XP Professional')).toBeInTheDocument();
  });
});
