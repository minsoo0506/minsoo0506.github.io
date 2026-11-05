import { act, fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MusicWindow } from '../windows/MusicWindow';

const api = {
  loadVideoById: vi.fn(),
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  destroy: vi.fn(),
  setVolume: vi.fn(),
  seekTo: vi.fn(),
  getDuration: () => 200,
  getCurrentTime: () => 10,
};
let events: {
  onReady: () => void;
  onStateChange: (event: { data: number }) => void;
  onError: () => void;
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
function mount() {
  vi.stubGlobal('YT', {
    Player: vi.fn(function (_host, options) {
      events = options.events;
      return api;
    }),
  });
  const view = render(<MusicWindow />);
  act(() => events.onReady());
  return view;
}
describe('MusicWindow', () => {
  it('selects the supplied video, controls playback and destroys playback on close', () => {
    const view = mount();
    fireEvent.click(screen.getByRole('button', { name: /Alonica/ }));
    expect(api.loadVideoById).toHaveBeenCalledWith('CYxcQILXXlg');
    expect(screen.getByRole('button', { name: 'Previous track' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next track' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(api.playVideo).toHaveBeenCalled();
    act(() => events.onStateChange({ data: 1 }));
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(api.pauseVideo).toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Volume'), { target: { value: '25' } });
    expect(api.setVolume).toHaveBeenLastCalledWith(25);
    view.unmount();
    expect(api.destroy).toHaveBeenCalledOnce();
  });
  it('stops at the beginning, restores volume after muting, and toggles the playlist', () => {
    mount();
    act(() => events.onStateChange({ data: 1 }));
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
    expect(api.pauseVideo).toHaveBeenCalled();
    expect(api.seekTo).toHaveBeenCalledWith(0, true);
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Volume'), { target: { value: '35' } });
    fireEvent.click(screen.getByRole('button', { name: 'Mute' }));
    expect(api.setVolume).toHaveBeenLastCalledWith(0);
    fireEvent.click(screen.getByRole('button', { name: 'Unmute' }));
    expect(api.setVolume).toHaveBeenLastCalledWith(35);
    fireEvent.click(screen.getByRole('button', { name: 'Hide playlist' }));
    expect(screen.queryByRole('complementary', { name: 'Playlist' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show playlist' }));
    expect(screen.getByRole('complementary', { name: 'Playlist' })).toBeInTheDocument();
    expect(api.destroy).not.toHaveBeenCalled();
  });
  it('stops after the single song and provides a fallback on error', () => {
    mount();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    act(() => events.onStateChange({ data: 0 }));
    expect(api.loadVideoById).not.toHaveBeenCalled();
    act(() => events.onError());
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open in YouTube/ })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=CYxcQILXXlg'
    );
  });
});
