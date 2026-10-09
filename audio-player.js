(() => {
  const player = document.querySelector('[data-article-audio]');
  if (!player) return;
  const audio = player.querySelector('audio');
  const slot = player.closest('.audio-slot');
  const stop = player.querySelector('[data-audio-stop]');
  const tools = player.querySelector('[data-audio-tools]');
  const speed = player.querySelector('[data-audio-speed]');
  let started = false;
  let visible = true;

  const dock = () => {
    const active = started && !visible;
    player.classList.toggle('audio-docked', active);
    document.body.classList.toggle('audio-dock-active', active);
    if (!active) slot.style.minHeight = `${player.offsetHeight}px`;
    else document.documentElement.style.setProperty('--audio-dock-height', `${player.offsetHeight + 24}px`);
  };
  tools.hidden = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      dock();
    }).observe(slot);
  }
  window.addEventListener('resize', dock);
  audio.addEventListener('play', () => {
    started = true;
    stop.hidden = false;
    dock();
    if ('mediaSession' in navigator && 'MediaMetadata' in window) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: player.dataset.title,
        artist: 'PaulWrites',
        artwork: [{ src: player.dataset.cover, type: 'image/webp' }]
      });
      navigator.mediaSession.playbackState = 'playing';
    }
  });
  audio.addEventListener('pause', () => {
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
  });
  const reset = () => {
    audio.pause();
    started = false;
    stop.hidden = true;
    dock();
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';
  };
  stop.addEventListener('click', () => { reset(); audio.currentTime = 0; });
  audio.addEventListener('ended', reset);
  audio.addEventListener('error', () => {
    reset();
    player.querySelector('.audio-error').hidden = false;
  });
  speed.addEventListener('change', () => { audio.playbackRate = Number(speed.value); });
  const seek = (seconds) => {
    if (Number.isFinite(audio.duration)) audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  };
  player.querySelectorAll('[data-audio-skip]').forEach(button => {
    button.addEventListener('click', () => seek(Number(button.dataset.audioSkip)));
  });
  if ('mediaSession' in navigator) {
    const handlers = {
      play: () => audio.play().catch(() => {}),
      pause: () => audio.pause(),
      seekbackward: (details) => seek(-(details.seekOffset || 15)),
      seekforward: (details) => seek(details.seekOffset || 15),
      seekto: (details) => { if (Number.isFinite(details.seekTime)) audio.currentTime = details.seekTime; }
    };
    Object.entries(handlers).forEach(([action, handler]) => {
      try { navigator.mediaSession.setActionHandler(action, handler); } catch (_) { /* Some browsers support only a subset. */ }
    });
  }
  dock();
})();
