import { useEffect, useRef, useState } from 'react';
import {
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
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
  const [showPlaylist, setShowPlaylist] = useState(true);
  const previousVolume = useRef(70);

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
  const togglePlayback = () =>
    playing ? player.current?.pauseVideo() : player.current?.playVideo();
  const stopPlayback = () => {
    player.current?.pauseVideo();
    player.current?.seekTo(0, true);
    setElapsed(0);
    setPlaying(false);
  };
  const toggleMute = () => {
    const next = volume ? 0 : previousVolume.current || 70;
    if (volume) previousVolume.current = volume;
    setVolume(next);
    player.current?.setVolume(next);
  };
  return (
    <section className="wmp wmp8" aria-label="My Music player">
      <div className="wmp8-shell">
        <aside className="wmp8-navigation" aria-label="Player navigation">
          <div className="wmp8-current">
            Now
            <br />
            Playing
          </div>
          <span aria-disabled="true">
            Media
            <br />
            Guide
          </span>
          <span aria-disabled="true">
            Copy
            <br />
            from CD
          </span>
          <button
            aria-pressed={showPlaylist}
            onClick={() => setShowPlaylist((visible) => !visible)}
          >
            Media
            <br />
            Library
          </button>
          <span aria-disabled="true">
            Radio
            <br />
            Tuner
          </span>
          <span aria-disabled="true">
            Copy to CD
            <br />
            or Device
          </span>
          <span aria-disabled="true">
            Skin
            <br />
            Chooser
          </span>
          <div className="wmp8-windows-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
        </aside>
        <div className="wmp8-main">
          <div className="wmp8-top-rail">
            <span className="wmp8-rail-emblem" aria-hidden="true">
              ◆
            </span>
            <span className="wmp8-rail-title">Windows Media Player</span>
            <button
              aria-label={showPlaylist ? 'Hide playlist' : 'Show playlist'}
              aria-pressed={showPlaylist}
              onClick={() => setShowPlaylist((visible) => !visible)}
            >
              <ListMusic size={12} />
            </button>
          </div>
          <div className="wmp8-stage" data-playlist={showPlaylist}>
            <div className="wmp8-screen-column">
              <header className="wmp8-track-heading">
                <span>{track.artist}</span>
                <h2>{track.title}</h2>
              </header>
              <div className="wmp-video" ref={host} />
              <div className="wmp8-video-caption">
                <span className="wmp8-caption-dot" />
                Now Playing<span>{track.artist}</span>
              </div>
            </div>
            {showPlaylist && (
              <aside className="wmp-playlist" aria-label="Playlist">
                <div className="wmp8-playlist-select">
                  <ListMusic size={14} />
                  <span>My Playlist</span>
                  <span aria-hidden="true">▾</span>
                </div>
                <div className="wmp8-playlist-group">− &nbsp; {track.artist}</div>
                <ol>
                  {tracks.map((item, number) => (
                    <li key={item.id}>
                      <button
                        disabled={!ready}
                        aria-current={index === number ? 'true' : undefined}
                        onClick={() => selectTrack(number)}
                      >
                        <span aria-hidden="true">{index === number && playing ? '▸' : '•'}</span>
                        <span>{item.title}</span>
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="wmp8-total">Total Time: {formatTime(duration)}</div>
              </aside>
            )}
          </div>
          {error && (
            <div className="wmp-error" role="alert">
              {error}
            </div>
          )}
          <div className="wmp8-readout">
            <Play size={12} fill="currentColor" />
            <span>
              {error
                ? 'Playback unavailable'
                : !ready
                ? 'Connecting…'
                : `${playing ? 'Playing' : 'Song'}: ${track.title}`}
            </span>
            <time>{formatTime(elapsed)}</time>
          </div>
        </div>
        <div className="wmp8-bottom">
          <div className="wmp8-console">
            <div className="wmp8-seek">
              <span aria-hidden="true">◂◂</span>
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
              <span aria-hidden="true">▸▸</span>
            </div>
            <div className="wmp8-buttons">
              <button
                className="wmp8-play"
                aria-label={playing ? 'Pause' : 'Play'}
                disabled={!ready}
                onClick={togglePlayback}
              >
                {playing ? (
                  <Pause size={19} fill="currentColor" />
                ) : (
                  <Play size={19} fill="currentColor" />
                )}
              </button>
              <button
                className="wmp8-stop"
                aria-label="Stop"
                disabled={!ready}
                onClick={stopPlayback}
              >
                <Square size={9} fill="currentColor" />
              </button>
              <button
                aria-label="Previous track"
                disabled={!ready || index === 0}
                onClick={() => selectTrack(index - 1)}
              >
                <SkipBack size={13} fill="currentColor" />
              </button>
              <button
                aria-label="Next track"
                disabled={!ready || index === tracks.length - 1}
                onClick={() => selectTrack(index + 1)}
              >
                <SkipForward size={13} fill="currentColor" />
              </button>
              <button
                className="wmp8-mute"
                aria-label={volume ? 'Mute' : 'Unmute'}
                disabled={!ready}
                onClick={toggleMute}
              >
                {volume ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>
              <input
                className="wmp8-volume"
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
            </div>
          </div>
          <div className="wmp8-metal-footer">
            <ListMusic size={16} />
            <a
              href={`https://www.youtube.com/watch?v=${track.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in YouTube ↗
            </a>
            <span aria-hidden="true" className="wmp8-grip">
              ⠿
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
