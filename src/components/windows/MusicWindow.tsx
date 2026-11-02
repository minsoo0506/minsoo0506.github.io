import { useEffect, useRef, useState } from 'react';
import { Music, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import './music-window.css';

const tracks = [{ id: 'CYxcQILXXlg', title: 'Alonica (Live)', artist: 'LANY' }];
interface Player {
  loadVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
  setVolume: (volume: number) => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
}
interface PlayerOptions {
  videoId: string;
  width: string;
  height: string;
  playerVars: { origin: string; playsinline: number; autoplay: number };
  events: {
    onReady: () => void;
    onStateChange: (event: { data: number }) => void;
    onError: () => void;
  };
}
declare global {
  interface Window {
    YT?: { Player: new (host: HTMLElement, options: PlayerOptions) => Player };
  }
}
const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`;

export function MusicWindow() {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<Player | null>(null);
  const selected = useRef(0);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(70);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);

  const selectTrack = (next: number) => {
    if (!player.current || !ready) return;
    selected.current = next;
    setIndex(next);
    setElapsed(0);
    setDuration(0);
    setPlaying(false);
    setError('');
    player.current.loadVideoById(tracks[next].id);
  };

  useEffect(() => {
    let disposed = false;
    let initialized = false;
    let progress: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      if (!disposed) setError('The player could not connect. Reopen My Music to try again.');
      clearInterval(poll);
    }, 15000);
    const initialize = () => {
      if (!window.YT?.Player || !host.current || initialized || disposed) return;
      initialized = true;
      clearInterval(poll);
      const element = document.createElement('div');
      host.current.appendChild(element);
      player.current = new window.YT.Player(element, {
        videoId: tracks[0].id,
        width: '100%',
        height: '100%',
        playerVars: { origin: window.location.origin, playsinline: 1, autoplay: 0 },
        events: {
          onReady: () => {
            if (disposed) return;
            clearTimeout(timeout);
            setReady(true);
            setError('');
            player.current?.setVolume(70);
            progress = setInterval(() => {
              setElapsed(player.current?.getCurrentTime() || 0);
              setDuration(player.current?.getDuration() || 0);
            }, 500);
          },
          onStateChange: ({ data }) => {
            if (disposed) return;
            setPlaying(data === 1);
            if (data === 0 && selected.current < tracks.length - 1) {
              selected.current += 1;
              setIndex(selected.current);
              setElapsed(0);
              setDuration(0);
              setError('');
              player.current?.loadVideoById(tracks[selected.current].id);
            }
          },
          onError: () => {
            if (disposed) return;
            clearTimeout(timeout);
            setPlaying(false);
            setError('This video cannot play here. Try another track or open it in YouTube.');
          },
        },
      });
    };
    if (
      !document.querySelector('script[src="https://www.youtube.com/iframe_api"]') &&
      !window.YT?.Player
    ) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);
    }
    const poll = setInterval(initialize, 100);
    initialize();
    return () => {
      disposed = true;
      clearTimeout(timeout);
      clearInterval(poll);
      clearInterval(progress);
      player.current?.destroy();
      player.current = null;
    };
  }, []);

  const track = tracks[index];
  return (
    <section className="wmp" aria-label="My Music player">
      <div className="wmp-toolbar">
        <span>
          <Music size={16} /> Windows Media Player
        </span>
        <span>9 SERIES</span>
      </div>
      <div className="wmp-heading">
        <span className="wmp-orb">
          <Play size={19} fill="currentColor" />
        </span>
        <div>
          <h2>Now Playing</h2>
          <p>My Music</p>
        </div>
        <span className="wmp-count">
          {String(tracks.length).padStart(2, '0')} {tracks.length === 1 ? 'TRACK' : 'TRACKS'}
        </span>
      </div>
      <div className="wmp-body">
        <div className="wmp-screen-column">
          <div className="wmp-video" ref={host} />
          <div className="wmp-track-info">
            <span className="wmp-led" data-playing={playing} />
            <div>
              <strong>{track.title}</strong>
              <span>{track.artist}</span>
            </div>
            <span className="wmp-time">{formatTime(elapsed)}</span>
          </div>
        </div>
        <aside className="wmp-playlist" aria-label="Playlist">
          <div className="wmp-list-heading">
            Now Playing List <span>{tracks.length}</span>
          </div>
          <ol>
            {tracks.map((item, number) => (
              <li key={item.id}>
                <button
                  disabled={!ready}
                  aria-current={index === number ? 'true' : undefined}
                  onClick={() => selectTrack(number)}
                >
                  <span className="wmp-number">
                    {index === number && playing ? '▶' : `0${number + 1}`}
                  </span>
                  <span>{item.title}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="wmp-list-footer">
            My Music · {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
          </div>
        </aside>
      </div>
      {error && (
        <div className="wmp-error" role="alert">
          {error}
        </div>
      )}
      <div className="wmp-controls">
        <div className="wmp-seek">
          <span>{formatTime(elapsed)}</span>
          <input
            aria-label="Playback position"
            type="range"
            min="0"
            max={duration || 1}
            value={Math.min(elapsed, duration || 1)}
            disabled={!ready || !duration}
            onChange={(event) => {
              const value = Number(event.target.value);
              setElapsed(value);
              player.current?.seekTo(value, true);
            }}
          />
          <span>{formatTime(duration)}</span>
        </div>
        <div className="wmp-buttons">
          <div className="wmp-transport">
            <button
              aria-label="Previous track"
              disabled={!ready || index === 0}
              onClick={() => selectTrack(index - 1)}
            >
              <SkipBack size={17} fill="currentColor" />
            </button>
            <button
              className="wmp-play"
              aria-label={playing ? 'Pause' : 'Play'}
              disabled={!ready}
              onClick={() => (playing ? player.current?.pauseVideo() : player.current?.playVideo())}
            >
              {playing ? (
                <Pause size={23} fill="currentColor" />
              ) : (
                <Play size={23} fill="currentColor" />
              )}
            </button>
            <button
              aria-label="Next track"
              disabled={!ready || index === tracks.length - 1}
              onClick={() => selectTrack(index + 1)}
            >
              <SkipForward size={17} fill="currentColor" />
            </button>
          </div>
          <label className="wmp-volume">
            <Volume2 size={17} />
            <input
              aria-label="Volume"
              type="range"
              min="0"
              max="100"
              value={volume}
              disabled={!ready}
              onChange={(event) => {
                const value = Number(event.target.value);
                setVolume(value);
                player.current?.setVolume(value);
              }}
            />
          </label>
        </div>
      </div>
      <div className="wmp-status">
        <span aria-live="polite">
          {error ? 'Playback unavailable' : !ready ? 'Connecting…' : playing ? 'Playing' : 'Ready'}
        </span>
        <a href={`https://www.youtube.com/watch?v=${track.id}`} target="_blank" rel="noreferrer">
          Open in YouTube ↗
        </a>
      </div>
    </section>
  );
}
