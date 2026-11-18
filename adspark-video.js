(() => {
  const player = document.querySelector('.demo-player');
  if (!player) return;
  const video = player.querySelector('video');
  const controls = player.querySelector('.demo-controls');
  const play = controls.querySelector('.demo-play');
  const start = player.querySelector('.demo-start');
  const speed = controls.querySelector('.demo-speed');
  const seek = controls.querySelector('.demo-seek');
  const time = controls.querySelector('.demo-time');
  const fullscreen = controls.querySelector('.demo-fullscreen');
  let scrubbing = false;
  let pendingTime = null;
  let fallbackLoading = false;
  let localObjectUrl = null;
  const format = value => { const seconds = Number.isFinite(value) ? Math.floor(value) : 0; return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; };
  const sync = () => {
    play.textContent = video.paused ? '▶' : 'Ⅱ';
    play.setAttribute('aria-label', video.paused ? '播放视频' : '暂停视频');
    player.classList.toggle('is-paused', video.paused);
    time.textContent = fallbackLoading ? '正在加载以跳转…' : `${format(pendingTime ?? video.currentTime)} / ${format(video.duration)}`;
    if (!scrubbing && pendingTime === null) seek.value = video.duration ? Math.round(video.currentTime / video.duration * 1000) : 0;
  };
  play.addEventListener('click', () => { if (video.paused) video.play().catch(() => {}); else video.pause(); });
  start.addEventListener('click', () => video.play().catch(() => {}));
  video.addEventListener('click', () => { if (video.paused) video.play().catch(() => {}); else video.pause(); });
  speed.addEventListener('click', () => {
    const speeds = [1, 1.5, 2];
    video.playbackRate = speeds[(speeds.indexOf(video.playbackRate) + 1) % speeds.length];
    speed.textContent = `${video.playbackRate}×`;
    const next = speeds[(speeds.indexOf(video.playbackRate) + 1) % speeds.length];
    speed.setAttribute('aria-label', `播放速度：${video.playbackRate}倍，点击切换到${next}倍`);
  });
  const seekToSelection = async () => {
    if (!Number.isFinite(video.duration) || !video.duration) return;
    pendingTime = Number(seek.value) / 1000 * video.duration;
    if (fallbackLoading) { sync(); return; }
    const available = [...Array(video.seekable.length)].some((_, i) => pendingTime >= video.seekable.start(i) && pendingTime <= video.seekable.end(i));
    if (available || localObjectUrl) {
      video.currentTime = pendingTime;
      pendingTime = null;
      sync();
      return;
    }
    fallbackLoading = true;
    const source = video.currentSrc;
    const shouldPlay = !video.paused;
    sync();
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error('视频加载失败');
      localObjectUrl = URL.createObjectURL(await response.blob());
      video.src = localObjectUrl;
      video.load();
      await new Promise((resolve, reject) => {
        video.addEventListener('loadedmetadata', resolve, { once: true });
        video.addEventListener('error', reject, { once: true });
      });
      video.currentTime = Math.min(pendingTime ?? 0, video.duration);
      pendingTime = null;
      if (shouldPlay) await video.play().catch(() => {});
    } catch (error) {
      console.error('视频跳转加载失败', error);
      pendingTime = null;
      time.textContent = '跳转失败，请重试';
    } finally {
      fallbackLoading = false;
      if (!time.textContent.includes('失败')) sync();
    }
  };
  seek.addEventListener('pointerdown', () => { scrubbing = true; });
  seek.addEventListener('pointerup', () => { scrubbing = false; });
  seek.addEventListener('pointercancel', () => { scrubbing = false; sync(); });
  seek.addEventListener('input', seekToSelection);
  window.addEventListener('pagehide', () => { if (localObjectUrl) URL.revokeObjectURL(localObjectUrl); }, { once: true });
  fullscreen.addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen?.(); else player.requestFullscreen?.(); });
  ['play', 'pause', 'timeupdate', 'loadedmetadata', 'durationchange', 'volumechange', 'ended'].forEach(event => video.addEventListener(event, sync));
  if (!player.requestFullscreen) fullscreen.hidden = true;
  video.controls = false;
  controls.hidden = false;
  start.hidden = false;
  player.classList.add('is-ready');
  video.addEventListener('play', () => { player.classList.add('has-started'); start.hidden = true; });
  sync();
})();
