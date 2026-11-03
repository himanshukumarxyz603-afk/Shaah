/* ==========================================================================
   PRINCESS SAMIKSHAAAA - BIRTHDAY FAIRY TALE & LILY GARDEN JAVASCRIPT
   Mobile-First Touch Interactions, Secret Vault & Royal Pigeon Love Letter
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. DUAL AUDIO ENGINE & BIDIRECTIONAL SWITCHING
     -------------------------------------------------------------------------- */
  const romanticBgm = document.getElementById('romanticBgm');
  const birthdaySong = document.getElementById('birthdaySong');
  const musicDisc = document.getElementById('musicDisc');
  const musicTitle = document.getElementById('musicTitle');
  const musicStatus = document.getElementById('musicStatus');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const musicBtnIcon = document.getElementById('musicBtnIcon');

  let currentAudio = romanticBgm;
  let isPlaying = false;
  let audioCtx = null;
  let wasPlayingBeforeVideo = false;
  let isInBirthdaySection = false;

  // Both songs in repeated (loop) mode
  romanticBgm.loop = true;
  birthdaySong.loop = true;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playMusicBoxNote(freq, timeOffset = 0, duration = 0.8) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);

    gain.gain.setValueAtTime(0.001, ctx.currentTime + timeOffset);
    gain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + timeOffset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + timeOffset + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + timeOffset);
    osc.stop(ctx.currentTime + timeOffset + duration);
  }

  const SoundFX = {
    playChime() {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, i) => playMusicBoxNote(f, i * 0.08, 0.5));
    },
    playKissPop() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    },
    playScanBlip(freq = 600) {
      playMusicBoxNote(freq, 0, 0.1);
    },
    playBlow() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.5);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    }
  };

  function isVideoReelPlaying() {
    const reels = document.querySelectorAll('.reel-video');
    return Array.from(reels).some(v => !v.paused && !v.ended && v.currentTime > 0);
  }

  function toggleMusic(forceState = null) {
    getAudioContext();
    const shouldPlay = forceState !== null ? forceState : !isPlaying;

    if (shouldPlay) {
      isPlaying = true;
      musicDisc.classList.add('playing');
      musicBtnIcon.className = 'fa-solid fa-pause';
      musicStatus.textContent = isInBirthdaySection ? 'Birthday Song 🎂' : 'Playing Romantic Song 🎵';

      const playPromise = currentAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log('Audio autoplay blocked, user interaction required:', err);
        });
      }
    } else {
      isPlaying = false;
      currentAudio.pause();
      musicDisc.classList.remove('playing');
      musicBtnIcon.className = 'fa-solid fa-play';
      musicStatus.textContent = 'Paused ⏸️';
    }
  }

  musicToggleBtn.addEventListener('click', () => toggleMusic());
  musicDisc.addEventListener('click', () => toggleMusic());

  // Switch to Looped Happy Birthday Song (Inside Birthday & Finale Sections)
  function switchToBirthdayTrack() {
    if (isInBirthdaySection) return;
    isInBirthdaySection = true;

    romanticBgm.pause();
    currentAudio = birthdaySong;
    currentAudio.currentTime = 0;
    currentAudio.loop = true;
    musicTitle.textContent = '🎂 Happy Birthday Song!';

    isPlaying = true;
    musicDisc.classList.add('playing');
    musicBtnIcon.className = 'fa-solid fa-pause';
    musicStatus.textContent = 'Sing Along! 🎉';

    const p = currentAudio.play();
    if (p !== undefined) {
      p.catch(err => {
        console.log('Birthday song autoplay prevented:', err);
        musicStatus.textContent = 'Tap to Play 🎂';
      });
    }
  }

  // Switch back to Romantic Song ("Hua Hai Aaj Pehli Baar") when scrolling out of Birthday section
  function switchToRomanticTrack() {
    if (!isInBirthdaySection) return;
    isInBirthdaySection = false;

    birthdaySong.pause();
    currentAudio = romanticBgm;
    currentAudio.loop = true;
    musicTitle.textContent = 'Hua Hai Aaj Pehli Baar 🎵';

    if (isVideoReelPlaying()) return;

    if (isPlaying) {
      musicDisc.classList.add('playing');
      musicBtnIcon.className = 'fa-solid fa-pause';
      musicStatus.textContent = 'Playing Romantic Song 🎵';

      const p = currentAudio.play();
      if (p !== undefined) {
        p.catch(err => console.log('Romantic song resume issue:', err));
      }
    }
  }

  /* --------------------------------------------------------------------------
     2. CONTINUOUS FAIRY DUST & FALLING LILY PETALS CANVAS
     -------------------------------------------------------------------------- */
  const fairyCanvas = document.getElementById('fairyDustCanvas');
  const fairyCtx = fairyCanvas ? fairyCanvas.getContext('2d') : null;
  let particles = [];
  let fairyWidth = fairyCanvas ? (fairyCanvas.width = window.innerWidth) : 0;
  let fairyHeight = fairyCanvas ? (fairyCanvas.height = window.innerHeight) : 0;

  window.addEventListener('resize', () => {
    if (!fairyCanvas) return;
    fairyWidth = fairyCanvas.width = window.innerWidth;
    fairyHeight = fairyCanvas.height = window.innerHeight;
  });

  class MagicParticle {
    constructor() {
      this.isPetal = Math.random() < 0.35;
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * fairyWidth;
      this.y = initial ? Math.random() * fairyHeight : -20;
      this.size = this.isPetal ? Math.random() * 8 + 8 : Math.random() * 2.5 + 1;
      this.speedY = this.isPetal ? Math.random() * 0.9 + 0.6 : Math.random() * 0.6 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.7;
      this.angle = Math.random() * Math.PI * 2;
      this.angleSpeed = (Math.random() - 0.5) * 0.03;
      this.opacity = Math.random() * 0.6 + 0.35;

      if (this.isPetal) {
        const petalColors = ['#FFFFFF', '#FFE4E8', '#FFD1DC', '#FFF0F5'];
        this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
      } else {
        const sparkleColors = ['#FFD1DC', '#F7D070', '#FFFFFF', '#B76E79'];
        this.color = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      }
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.015) * 0.5;
      this.angle += this.angleSpeed;

      if (this.y > fairyHeight + 25 || this.x < -20 || this.x > fairyWidth + 20) {
        this.reset();
      }
    }

    draw() {
      if (!fairyCtx) return;
      fairyCtx.save();
      fairyCtx.globalAlpha = this.opacity;
      fairyCtx.translate(this.x, this.y);

      if (this.isPetal) {
        fairyCtx.rotate(this.angle);
        fairyCtx.fillStyle = this.color;
        fairyCtx.shadowBlur = 4;
        fairyCtx.shadowColor = 'rgba(255, 182, 193, 0.5)';
        fairyCtx.beginPath();
        fairyCtx.ellipse(0, 0, this.size * 0.45, this.size, Math.PI / 4, 0, Math.PI * 2);
        fairyCtx.fill();

        fairyCtx.strokeStyle = 'rgba(244, 194, 194, 0.4)';
        fairyCtx.lineWidth = 0.8;
        fairyCtx.beginPath();
        fairyCtx.moveTo(0, -this.size * 0.7);
        fairyCtx.lineTo(0, this.size * 0.7);
        fairyCtx.stroke();
      } else {
        fairyCtx.fillStyle = this.color;
        fairyCtx.shadowBlur = 6;
        fairyCtx.shadowColor = this.color;
        fairyCtx.beginPath();
        fairyCtx.arc(0, 0, this.size, 0, Math.PI * 2);
        fairyCtx.fill();
      }
      fairyCtx.restore();
    }
  }

  if (fairyCanvas) {
    for (let i = 0; i < 45; i++) {
      particles.push(new MagicParticle());
    }

    function animateFairyDust() {
      if (!document.hidden && fairyCtx) {
        fairyCtx.clearRect(0, 0, fairyWidth, fairyHeight);
        particles.forEach(p => {
          p.update();
          p.draw();
        });
      }
      requestAnimationFrame(animateFairyDust);
    }
    animateFairyDust();
  }

  /* --------------------------------------------------------------------------
     3. TOUCH SPARKLE & EMOJI TRAIL (Subtle, Throttled & Mobile-Optimized)
     -------------------------------------------------------------------------- */
  const trailPool = [];
  const MAX_TRAIL = 8;
  const TRAIL_LIFETIME = 800; // 700 to 900ms
  const THROTTLE_MS = 135; // 120 to 150ms
  const SOFT_EMOJIS = ['🌸', '✨', '💖', '🤍']; // 4 soft emojis
  let lastTrailSpawnTime = 0;

  function isInteractiveElement(target) {
    if (!target || !target.closest) return false;
    return !!target.closest(
      'button, a, input, select, textarea, [role="button"], ' +
      '#scannerPad, .scanner-pad, #scannerSection, ' +
      'canvas, .scratch-canvas, #scratchSection, ' +
      '#marathonHeartBtn, .marathon-heart-btn, #marathonTapArena, #kissMarathonSection, ' +
      '#loveSlider, .custom-love-slider, #loveMeterSection, ' +
      '.video-carousel-container, video, #videoZoneSection, ' +
      '.interactive-wax-stamp, .red-wax-seal-btn, #royalWaxSealBtn, ' +
      '.love-book-album, .hanging-polaroids-scroll, #loveBookStage, ' +
      '.music-pill-widget, .wish-wand-btn, .easter-egg-heart, ' +
      '.reason-card-flip, .coupon-action-btn, #quizArena'
    );
  }

  function spawnTrail(x, y, target) {
    if (isInteractiveElement(target)) return;

    const now = performance.now();
    if (now - lastTrailSpawnTime < THROTTLE_MS) return;
    lastTrailSpawnTime = now;

    // Limit active elements to at most 8; remove oldest if limit reached
    while (trailPool.length >= MAX_TRAIL) {
      const oldest = trailPool.shift();
      if (oldest && oldest.parentNode) oldest.remove();
    }

    const span = document.createElement('span');
    span.className = 'touch-trail-sparkle';
    span.textContent = SOFT_EMOJIS[Math.floor(Math.random() * SOFT_EMOJIS.length)];
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;

    document.body.appendChild(span);
    trailPool.push(span);

    // CSS transform & opacity fade-out
    requestAnimationFrame(() => {
      span.classList.add('fade-out');
    });

    setTimeout(() => {
      if (span.parentNode) span.remove();
      const idx = trailPool.indexOf(span);
      if (idx !== -1) trailPool.splice(idx, 1);
    }, TRAIL_LIFETIME);
  }

  // Touch start: at most one per touch-start
  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      spawnTrail(e.touches[0].clientX, e.touches[0].clientY, e.target);
    }
  }, { passive: true });

  // Touch move: throttled to 120-150ms
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      spawnTrail(e.touches[0].clientX, e.touches[0].clientY, e.target);
    }
  }, { passive: true });

  // Pointer move (for desktop preview testing only when dragging or clicked)
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' && e.buttons === 0) return;
    spawnTrail(e.clientX, e.clientY, e.target);
  }, { passive: true });

  /* --------------------------------------------------------------------------
     4. FLOATING BALLOONS (Hero Section)
     -------------------------------------------------------------------------- */
  const balloonsContainer = document.getElementById('balloonsContainer');
  const balloonColors = [
    'linear-gradient(135deg, #FFB6C1, #FF69B4)',
    'linear-gradient(135deg, #FFD1DC, #F48FB1)',
    'linear-gradient(135deg, #FFE4E8, #FF80AB)',
    'linear-gradient(135deg, #FFF0B5, #FFD700)'
  ];

  function createFloatingBalloon() {
    if (!balloonsContainer) return;
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.style.left = `${Math.random() * 88 + 6}%`;
    balloon.style.background = balloonColors[Math.floor(Math.random() * balloonColors.length)];
    const duration = Math.random() * 5 + 10;
    balloon.style.animationDuration = `${duration}s`;
    balloon.style.transform = `scale(${Math.random() * 0.4 + 0.8})`;

    balloonsContainer.appendChild(balloon);
    setTimeout(() => balloon.remove(), duration * 1000);
  }

  for (let i = 0; i < 5; i++) {
    setTimeout(createFloatingBalloon, i * 1500);
  }
  setInterval(createFloatingBalloon, 2400);

  /* --------------------------------------------------------------------------
     5. THE ENTRY GATE: T&C MODAL
     -------------------------------------------------------------------------- */
  const entryModalOverlay = document.getElementById('entryModalOverlay');
  const tcAgreement = document.getElementById('tcAgreement');
  const enterWorldBtn = document.getElementById('enterWorldBtn');

  if (tcAgreement && enterWorldBtn) {
    tcAgreement.addEventListener('change', () => {
      enterWorldBtn.disabled = !tcAgreement.checked;
      if (tcAgreement.checked) SoundFX.playChime();
    });

    enterWorldBtn.addEventListener('click', () => {
      getAudioContext();
      toggleMusic(true);
      SoundFX.playChime();

      if (window.confetti) {
        window.confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFD1DC', '#F4C2C2', '#FFD700', '#FFFFFF']
        });
      }

      entryModalOverlay.classList.add('hidden');

      if (window.AOS) {
        setTimeout(() => {
          window.AOS.init({ duration: 800, once: true, offset: 60 });
        }, 250);
      }
    });
  }

  /* --------------------------------------------------------------------------
     6. GAME 1: PRINCESS FINGERPRINT SCANNER
     -------------------------------------------------------------------------- */
  const scannerPad = document.getElementById('scannerPad');
  const scannerStatusText = document.getElementById('scannerStatusText');
  const scanProgressBar = document.getElementById('scanProgressBar');
  const scanPercent = document.getElementById('scanPercent');
  const scannerResultModal = document.getElementById('scannerResultModal');
  const closeScannerResultBtn = document.getElementById('closeScannerResultBtn');

  let scanProgress = 0;
  let scanInterval = null;
  let isScanning = false;
  let scanCompleted = false;

  function startScanning(e) {
    if (scanCompleted) return;
    if (e.cancelable && e.type.startsWith('touch')) e.preventDefault();

    isScanning = true;
    if (scannerPad) {
      scannerPad.parentElement.classList.add('scanning');
      scannerPad.classList.add('active');
    }
    if (scannerStatusText) {
      scannerStatusText.textContent = 'Scanning Princess Thumb... 🔍';
      scannerStatusText.style.color = '#B76E79';
    }

    if (navigator.vibrate) navigator.vibrate([30, 40, 30]);

    clearInterval(scanInterval);
    scanInterval = setInterval(() => {
      if (!isScanning) return;
      scanProgress += 2.8;

      if (scanProgress % 20 < 3) SoundFX.playScanBlip(550 + scanProgress * 4);

      if (scanProgress >= 100) {
        scanProgress = 100;
        completeScanning();
      }

      if (scanProgressBar) scanProgressBar.style.width = `${scanProgress}%`;
      if (scanPercent) scanPercent.textContent = `${Math.floor(scanProgress)}% Scanned`;
    }, 45);
  }

  function stopScanning() {
    if (scanCompleted) return;
    isScanning = false;
    clearInterval(scanInterval);
    if (scannerPad) {
      scannerPad.parentElement.classList.remove('scanning');
      scannerPad.classList.remove('active');
    }

    if (scanProgress < 100) {
      scanProgress = 0;
      if (scanProgressBar) scanProgressBar.style.width = '0%';
      if (scanPercent) scanPercent.textContent = '0% Scanned';
      if (scannerStatusText) {
        scannerStatusText.textContent = 'Hold it down a little longer baby! 💖';
        scannerStatusText.style.color = '#D81B60';
      }
    }
  }

  function completeScanning() {
    clearInterval(scanInterval);
    isScanning = false;
    scanCompleted = true;
    if (scannerPad) {
      scannerPad.parentElement.classList.remove('scanning');
      scannerPad.classList.remove('active');
    }

    SoundFX.playChime();
    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#FF69B4', '#FFFFFF']
      });
    }

    setTimeout(() => {
      if (scannerResultModal) scannerResultModal.classList.add('active');
    }, 350);
  }

  if (scannerPad) {
    scannerPad.addEventListener('mousedown', startScanning);
    window.addEventListener('mouseup', stopScanning);
    scannerPad.addEventListener('touchstart', startScanning, { passive: false });
    scannerPad.addEventListener('touchend', stopScanning);
    scannerPad.addEventListener('touchcancel', stopScanning);
  }

  if (closeScannerResultBtn) {
    closeScannerResultBtn.addEventListener('click', () => {
      if (scannerResultModal) scannerResultModal.classList.remove('active');
      const quizSec = document.getElementById('quizSection');
      if (quizSec) quizSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------------------------
     7. GAME 2: THE NAUGHTY QUIZ (Dodging Buttons)
     -------------------------------------------------------------------------- */
  const quizArena = document.getElementById('quizArena');
  const dodgeBtn1 = document.getElementById('dodgeBtn1');
  const dodgeBtn2 = document.getElementById('dodgeBtn2');
  const unlimitedBtn = document.getElementById('unlimitedBtn');
  const quizSuccessModal = document.getElementById('quizSuccessModal');
  const closeQuizSuccessBtn = document.getElementById('closeQuizSuccessBtn');
  const quizToast = document.getElementById('quizToast');

  const naughtyRemarks = [
    "No way! You need more kisses than that! 😜",
    "Haha caught you! 1 hour is too little! 🙈",
    "Try again, Princess! Only one correct answer! 💕",
    "Nope! Himanshu has way more kisses ready! 🥰"
  ];

  function dodgeButton(btn) {
    if (!btn || !quizArena) return;
    const maxX = 120;
    const maxY = 55;
    const randX = (Math.random() - 0.5) * maxX * 2;
    const randY = (Math.random() - 0.5) * maxY * 2;
    btn.style.transform = `translate(${randX}px, ${randY}px) scale(0.95)`;

    if (navigator.vibrate) navigator.vibrate(20);
    SoundFX.playKissPop();

    if (quizToast) {
      quizToast.textContent = naughtyRemarks[Math.floor(Math.random() * naughtyRemarks.length)];
      quizToast.style.color = '#D81B60';
    }
  }

  if (dodgeBtn1) {
    dodgeBtn1.addEventListener('mouseover', () => dodgeButton(dodgeBtn1));
    dodgeBtn1.addEventListener('touchstart', (e) => {
      e.preventDefault();
      dodgeButton(dodgeBtn1);
    }, { passive: false });
  }

  if (dodgeBtn2) {
    dodgeBtn2.addEventListener('mouseover', () => dodgeButton(dodgeBtn2));
    dodgeBtn2.addEventListener('touchstart', (e) => {
      e.preventDefault();
      dodgeButton(dodgeBtn2);
    }, { passive: false });
  }

  if (unlimitedBtn) {
    unlimitedBtn.addEventListener('click', () => {
      SoundFX.playChime();
      if (navigator.vibrate) navigator.vibrate([40, 40, 40]);

      if (window.confetti) {
        window.confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#FF69B4', '#FFD700', '#FF1493', '#FFFFFF']
        });
      }

      setTimeout(() => {
        if (quizSuccessModal) quizSuccessModal.classList.add('active');
      }, 300);
    });
  }

  if (closeQuizSuccessBtn) {
    closeQuizSuccessBtn.addEventListener('click', () => {
      if (quizSuccessModal) quizSuccessModal.classList.remove('active');
      const scratchSec = document.getElementById('scratchSection');
      if (scratchSec) scratchSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------------------------
     8. GAME 3: SCRATCH CARDS
     -------------------------------------------------------------------------- */
  function initScratchCard(canvasId, statusId, prizeId) {
    const canvas = document.getElementById(canvasId);
    const statusText = document.getElementById(statusId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    let isDrawing = false;
    let revealed = false;

    // Golden foil cover
    ctx.fillStyle = '#C5A059';
    ctx.fillRect(0, 0, width, height);

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#E6C687');
    grad.addColorStop(0.5, '#F7E7B4');
    grad.addColorStop(1, '#C5A059');
    ctx.fillStyle = grad;
    ctx.fillRect(4, 4, width - 8, height - 8);

    ctx.font = 'bold 15px Poppins, sans-serif';
    ctx.fillStyle = '#6D4C15';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH WITH FINGER ✨', width / 2, height / 2 - 5);
    ctx.font = '12px Poppins, sans-serif';
    ctx.fillText('Princess Surprise Below', width / 2, height / 2 + 18);

    function scratch(x, y) {
      if (revealed) return;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      checkScratched();
    }

    function checkScratched() {
      if (revealed) return;
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      let transparentCount = 0;

      for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] === 0) transparentCount++;
      }

      const totalChecked = pixels.length / 16;
      const percent = (transparentCount / totalChecked) * 100;

      if (percent > 38) {
        revealed = true;
        canvas.style.transition = 'opacity 0.6s ease';
        canvas.style.opacity = '0';
        setTimeout(() => { canvas.style.display = 'none'; }, 600);

        if (statusText) {
          statusText.innerHTML = '🎉 Unlocked! Valid Forever for You!';
          statusText.style.color = '#4CAF50';
          statusText.style.fontWeight = '700';
        }

        SoundFX.playChime();
        if (navigator.vibrate) navigator.vibrate(30);
        if (window.confetti) {
          window.confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#FFD700', '#FF69B4', '#FFF']
          });
        }
      }
    }

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if (e.touches && e.touches[0]) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    canvas.addEventListener('mousedown', (e) => { isDrawing = true; const c = getCoords(e); scratch(c.x, c.y); });
    window.addEventListener('mouseup', () => { isDrawing = false; });
    canvas.addEventListener('mousemove', (e) => { if (isDrawing) { const c = getCoords(e); scratch(c.x, c.y); } });

    canvas.addEventListener('touchstart', (e) => { isDrawing = true; const c = getCoords(e); scratch(c.x, c.y); }, { passive: true });
    window.addEventListener('touchend', () => { isDrawing = false; });
    canvas.addEventListener('touchmove', (e) => { if (isDrawing) { const c = getCoords(e); scratch(c.x, c.y); } }, { passive: true });
  }

  initScratchCard('scratchCanvas1', 'scratchStatus1', 'prize1');
  initScratchCard('scratchCanvas2', 'scratchStatus2', 'prize2');

  /* --------------------------------------------------------------------------
     9. BLOOM A LILY GARDEN
     -------------------------------------------------------------------------- */
  const lilyItems = document.querySelectorAll('.lily-flower-item');
  const lilyRevealedMsg = document.getElementById('lilyRevealedMsg');

  lilyItems.forEach(item => {
    item.addEventListener('click', () => {
      const iconWrap = item.querySelector('.lily-bloom-icon');
      const clickTag = item.querySelector('.lily-click-tag');
      const msg = item.getAttribute('data-msg');

      if (iconWrap) iconWrap.textContent = '🌸';
      if (clickTag) clickTag.textContent = 'Bloomed! 💕';
      item.classList.add('bloomed');

      if (lilyRevealedMsg) {
        lilyRevealedMsg.textContent = msg;
        lilyRevealedMsg.style.color = '#792537';
        lilyRevealedMsg.style.fontWeight = '600';
      }

      SoundFX.playChime();
      if (navigator.vibrate) navigator.vibrate(25);
    });
  });

  /* --------------------------------------------------------------------------
     10. LOVE METER SLIDER
     -------------------------------------------------------------------------- */
  const loveSlider = document.getElementById('loveSlider');
  const loveMainVal = document.getElementById('loveMainVal');
  const loveQuoteVal = document.getElementById('loveQuoteVal');
  const beatingHeart = document.getElementById('beatingHeart');

  if (loveSlider) {
    loveSlider.addEventListener('input', () => {
      const val = parseInt(loveSlider.value);

      if (val >= 980) {
        loveMainVal.textContent = 'Infinity & Beyond! 🚀💖';
        loveQuoteVal.textContent = '"My love for you cannot be measured by numbers!"';
      } else if (val >= 700) {
        loveMainVal.textContent = `${val}% 💕`;
        loveQuoteVal.textContent = '"A true princess level of unconditional love!"';
      } else if (val >= 400) {
        loveMainVal.textContent = `${val}% 🥰`;
        loveQuoteVal.textContent = '"Getting warmer! My heart is pounding fast!"';
      } else {
        loveMainVal.textContent = `${val}% 🌸`;
        loveQuoteVal.textContent = '"A sweet start, but drag it further to infinity!"';
      }

      const scale = 1 + (val / 1000) * 0.45;
      if (beatingHeart) beatingHeart.style.transform = `scale(${scale})`;
    });
  }

  /* --------------------------------------------------------------------------
     11. KISSING MARATHON CHALLENGE
     -------------------------------------------------------------------------- */
  const marathonHeartBtn = document.getElementById('marathonHeartBtn');
  const marathonTapArena = document.getElementById('marathonTapArena');
  const marathonTimer = document.getElementById('marathonTimer');
  const marathonScore = document.getElementById('marathonScore');
  const marathonTapHint = document.getElementById('marathonTapHint');
  const marathonResultCard = document.getElementById('marathonResultCard');
  const finalScoreVal = document.getElementById('finalScoreVal');
  const marathonRestartBtn = document.getElementById('marathonRestartBtn');

  let marathonActive = false;
  let marathonTimeLeft = 10.0;
  let marathonKisses = 0;
  let marathonTimerInterval = null;

  function spawnFloatingKiss(x, y) {
    const kiss = document.createElement('div');
    kiss.textContent = '💋';
    kiss.style.position = 'fixed';
    kiss.style.left = `${x}px`;
    kiss.style.top = `${y}px`;
    kiss.style.fontSize = '2rem';
    kiss.style.pointerEvents = 'none';
    kiss.style.zIndex = '9999';
    kiss.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
    document.body.appendChild(kiss);

    setTimeout(() => {
      kiss.style.transform = `translateY(-90px) scale(1.4) rotate(${(Math.random() - 0.5) * 40}deg)`;
      kiss.style.opacity = '0';
    }, 20);

    setTimeout(() => kiss.remove(), 850);
  }

  function handleMarathonTap(e) {
    if (!marathonActive && marathonTimeLeft === 10.0) {
      startMarathon();
    }
    if (!marathonActive) return;

    marathonKisses++;
    if (marathonScore) marathonScore.textContent = marathonKisses;
    SoundFX.playKissPop();
    if (navigator.vibrate) navigator.vibrate(15);

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    spawnFloatingKiss(clientX || window.innerWidth / 2, clientY || window.innerHeight / 2);
  }

  function startMarathon() {
    marathonActive = true;
    if (marathonTapHint) marathonTapHint.textContent = 'TAP FAST! FAST! FAST! 🔥';

    marathonTimerInterval = setInterval(() => {
      marathonTimeLeft -= 0.1;
      if (marathonTimerLeft <= 0) {
        marathonTimeLeft = 0;
        endMarathon();
      }
      if (marathonTimer) marathonTimer.textContent = `${marathonTimeLeft.toFixed(1)}s`;
    }, 100);
  }

  function endMarathon() {
    clearInterval(marathonTimerInterval);
    marathonActive = false;
    if (marathonTimer) marathonTimer.textContent = '0.0s';
    if (marathonHeartBtn) marathonHeartBtn.style.display = 'none';
    if (marathonTapHint) marathonTapHint.style.display = 'none';

    if (finalScoreVal) finalScoreVal.textContent = marathonKisses;
    if (marathonResultCard) marathonResultCard.style.display = 'block';

    SoundFX.playChime();
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    if (window.confetti) {
      window.confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF69B4', '#FF1493', '#FFFFFF']
      });
    }
  }

  if (marathonHeartBtn) {
    marathonHeartBtn.addEventListener('mousedown', handleMarathonTap);
    marathonHeartBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleMarathonTap(e);
    }, { passive: false });
  }

  if (marathonRestartBtn) {
    marathonRestartBtn.addEventListener('click', () => {
      marathonTimeLeft = 10.0;
      marathonKisses = 0;
      if (marathonTimer) marathonTimer.textContent = '10.0s';
      if (marathonScore) marathonScore.textContent = '0';
      if (marathonHeartBtn) marathonHeartBtn.style.display = 'flex';
      if (marathonTapHint) {
        marathonTapHint.style.display = 'block';
        marathonTapHint.textContent = 'Tap the heart to start!';
      }
      if (marathonResultCard) marathonResultCard.style.display = 'none';
    });
  }

  /* --------------------------------------------------------------------------
     12. TASK 3: 10 REASONS WHY I LOVE YOU (Flip Cards)
     -------------------------------------------------------------------------- */
  const reasonCards = document.querySelectorAll('.reason-card-flip');
  reasonCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      SoundFX.playKissPop();
      if (navigator.vibrate) navigator.vibrate(25);
    });
  });

  /* --------------------------------------------------------------------------
     13. TASK 3: PRINCESS LOVE COUPONS (Redeem)
     -------------------------------------------------------------------------- */
  const couponBtns = document.querySelectorAll('.coupon-action-btn');
  couponBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentCard = btn.closest('.love-coupon-card');
      if (!parentCard || parentCard.classList.contains('redeemed')) return;

      parentCard.classList.add('redeemed');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Redeemed! 💕</span>';

      SoundFX.playChime();
      if (navigator.vibrate) navigator.vibrate([30, 20, 30]);

      if (window.confetti) {
        window.confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#FF69B4', '#FFD700', '#FFF']
        });
      }
    });
  });

  /* --------------------------------------------------------------------------
     14. SECRET VAULT MODAL & PASSWORD ('Himanshika')
     -------------------------------------------------------------------------- */
  const openVaultModalBtn = document.getElementById('openVaultModalBtn');
  const passwordModalOverlay = document.getElementById('passwordModalOverlay');
  const passwordModalCard = document.getElementById('passwordModalCard');
  const closePasswordModalBtn = document.getElementById('closePasswordModalBtn');
  const vaultPasswordInput = document.getElementById('vaultPasswordInput');
  const submitPasswordBtn = document.getElementById('submitPasswordBtn');
  const passwordErrorMsg = document.getElementById('passwordErrorMsg');
  const secretGallerySection = document.getElementById('secretGallerySection');

  if (openVaultModalBtn) {
    openVaultModalBtn.addEventListener('click', () => {
      if (passwordModalOverlay) passwordModalOverlay.classList.add('active');
      if (vaultPasswordInput) {
        vaultPasswordInput.value = '';
        setTimeout(() => vaultPasswordInput.focus(), 250);
      }
      if (passwordErrorMsg) passwordErrorMsg.style.display = 'none';
    });
  }

  if (closePasswordModalBtn) {
    closePasswordModalBtn.addEventListener('click', () => {
      if (passwordModalOverlay) passwordModalOverlay.classList.remove('active');
    });
  }

  function verifyVaultPassword() {
    if (!vaultPasswordInput) return;
    const val = vaultPasswordInput.value.trim().toLowerCase();

    // Password: Himanshika (case-insensitive)
    if (val === 'himanshika') {
      SoundFX.playChime();
      if (passwordModalOverlay) passwordModalOverlay.classList.remove('active');

      if (window.confetti) {
        window.confetti({
          particleCount: 110,
          spread: 120,
          origin: { y: 0.5 },
          colors: ['#FF69B4', '#D81B60', '#FFD700', '#FFFFFF']
        });
      }

      if (secretGallerySection) {
        secretGallerySection.style.display = 'block';
        setTimeout(() => {
          secretGallerySection.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    } else {
      if (passwordErrorMsg) passwordErrorMsg.style.display = 'block';
      if (passwordModalCard) {
        passwordModalCard.classList.remove('shake-error');
        void passwordModalCard.offsetWidth;
        passwordModalCard.classList.add('shake-error');
      }
      if (navigator.vibrate) navigator.vibrate([50, 40, 50]);
    }
  }

  if (submitPasswordBtn) submitPasswordBtn.addEventListener('click', verifyVaultPassword);
  if (vaultPasswordInput) {
    vaultPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') verifyVaultPassword();
    });
  }

  /* --------------------------------------------------------------------------
     15. REDESIGNED SECRET VAULT: "OUR LITTLE FAIRY TALE" (Love Book & Polaroids)
     -------------------------------------------------------------------------- */
  const bookPages = document.querySelectorAll('.book-page');
  const loveBookPrevBtn = document.getElementById('loveBookPrevBtn');
  const loveBookNextBtn = document.getElementById('loveBookNextBtn');
  const loveBookPageIndicator = document.getElementById('loveBookPageIndicator');
  const loveBookStage = document.getElementById('loveBookStage');

  let currentBookPageIndex = 0;
  const totalBookPages = bookPages.length || 10;

  function setBookPage(index) {
    if (!bookPages.length) return;
    currentBookPageIndex = (index + totalBookPages) % totalBookPages;

    bookPages.forEach((page, idx) => {
      page.classList.toggle('active', idx === currentBookPageIndex);
    });

    if (loveBookPageIndicator) {
      loveBookPageIndicator.innerHTML = `Memory <strong>${currentBookPageIndex + 1}</strong> of ${totalBookPages}`;
    }
  }

  if (loveBookPrevBtn) {
    loveBookPrevBtn.addEventListener('click', () => {
      setBookPage(currentBookPageIndex - 1);
      SoundFX.playKissPop();
      if (navigator.vibrate) navigator.vibrate(20);
    });
  }

  if (loveBookNextBtn) {
    loveBookNextBtn.addEventListener('click', () => {
      setBookPage(currentBookPageIndex + 1);
      SoundFX.playKissPop();
      if (navigator.vibrate) navigator.vibrate(20);
    });
  }

  // Swipe detection on Love Book Album (Mobile Gestures)
  if (loveBookStage) {
    let bookTouchStartX = 0;
    let bookTouchEndX = 0;

    loveBookStage.addEventListener('touchstart', (e) => {
      bookTouchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    loveBookStage.addEventListener('touchend', (e) => {
      bookTouchEndX = e.changedTouches[0].clientX;
      const diff = bookTouchEndX - bookTouchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) setBookPage(currentBookPageIndex + 1);
        else setBookPage(currentBookPageIndex - 1);
        SoundFX.playKissPop();
      }
    }, { passive: true });
  }

  // Lightbox Modal for Photo Zoom (with Heart Burst Animation)
  const lightboxOverlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

  function openLightbox(src, title, text) {
    if (!lightboxOverlay || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) {
      lightboxCaption.innerHTML = `<strong>${title}</strong><br>${text}`;
    }
    lightboxOverlay.classList.add('active');
    SoundFX.playChime();
    if (navigator.vibrate) navigator.vibrate(30);

    // Heart burst animation
    if (window.confetti) {
      window.confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#FF69B4', '#FFD1DC', '#FFF', '#E91E63']
      });
    }
  }

  // Wire up Love Book photo clicks
  const bookPhotoFrames = document.querySelectorAll('.photo-frame-golden, .photo-frame-heart');
  bookPhotoFrames.forEach(frame => {
    frame.addEventListener('click', () => {
      const src = frame.getAttribute('data-zoom-src');
      const title = frame.getAttribute('data-zoom-title');
      const text = frame.getAttribute('data-zoom-text');
      if (src) openLightbox(src, title, text);
    });
  });

  // Wire up Hanging Polaroids clicks
  const hangingPolaroids = document.querySelectorAll('.hanging-polaroid');
  hangingPolaroids.forEach(polaroid => {
    polaroid.addEventListener('click', () => {
      const photoNum = polaroid.getAttribute('data-photo');
      const img = polaroid.querySelector('.polaroid-img');
      const tag = polaroid.querySelector('.polaroid-tag-text');
      if (img && tag) {
        openLightbox(img.src, tag.textContent, `Memory #${photoNum} with Princess Samikshaaaa 🌸`);
      }
    });
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', () => {
      if (lightboxOverlay) lightboxOverlay.classList.remove('active');
    });
  }
  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === lightboxOverlay) lightboxOverlay.classList.remove('active');
    });
  }

  /* --------------------------------------------------------------------------
     16. EASTER EGG HEART: SECRET ROMANTIC MESSAGE
     -------------------------------------------------------------------------- */
  const secretHeartBtn = document.getElementById('secretHeartBtn');
  const secretHeartModal = document.getElementById('secretHeartModal');
  const closeSecretHeartBtn = document.getElementById('closeSecretHeartBtn');

  if (secretHeartBtn) {
    secretHeartBtn.addEventListener('click', () => {
      if (secretHeartModal) secretHeartModal.classList.add('active');
      SoundFX.playChime();
      if (navigator.vibrate) navigator.vibrate([30, 20, 30]);

      if (window.confetti) {
        window.confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF69B4', '#FFD700', '#FFF']
        });
      }
    });
  }

  if (closeSecretHeartBtn) {
    closeSecretHeartBtn.addEventListener('click', () => {
      if (secretHeartModal) secretHeartModal.classList.remove('active');
    });
  }

  /* --------------------------------------------------------------------------
     17. GRAND FINALE: 3D CAKE & BLOWABLE CANDLES
     -------------------------------------------------------------------------- */
  const birthdayCake = document.getElementById('birthdayCake');
  const blowCandlesBtn = document.getElementById('blowCandlesBtn');
  const blowBtnText = document.getElementById('blowBtnText');
  const blowTipText = document.getElementById('blowTipText');
  const postBlowBanner = document.getElementById('postBlowBanner');
  const candleFlames = document.querySelectorAll('.candle-flame');
  let candlesBlown = false;

  function blowCandles() {
    if (candlesBlown) return;
    candlesBlown = true;

    SoundFX.playBlow();
    if (navigator.vibrate) navigator.vibrate([40, 50, 40]);
    candleFlames.forEach(flame => flame.classList.add('blown-out'));

    if (blowBtnText) blowBtnText.textContent = '✨ Candles Blown! Wish Granted! ✨';
    if (blowTipText) blowTipText.textContent = 'Your birthday wish is on its way to the stars! 🌟';
    if (blowCandlesBtn) blowCandlesBtn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';

    switchToBirthdayTrack();
    if (postBlowBanner) postBlowBanner.style.display = 'block';

    if (window.confetti) {
      const duration = 3.5 * 1000;
      const animationEnd = Date.now() + duration;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        window.confetti({
          particleCount: 40,
          spread: 360,
          origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() - 0.2 },
          colors: ['#FFD1DC', '#FF69B4', '#FFD700', '#FFF']
        });
      }, 350);
    }

    startFireworks();
  }

  if (blowCandlesBtn) blowCandlesBtn.addEventListener('click', blowCandles);
  if (birthdayCake) birthdayCake.addEventListener('click', blowCandles);

  /* Fireworks Canvas Animation */
  const fireworksCanvas = document.getElementById('fireworksCanvas');
  const fwCtx = fireworksCanvas ? fireworksCanvas.getContext('2d') : null;
  let fwParticles = [];
  let fireworksRunning = false;

  function resizeFireworks() {
    if (!fireworksCanvas || !fireworksCanvas.parentElement) return;
    fireworksCanvas.width = fireworksCanvas.parentElement.offsetWidth;
    fireworksCanvas.height = fireworksCanvas.parentElement.offsetHeight;
  }
  window.addEventListener('resize', resizeFireworks);

  class FireworkParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4.5 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.gravity = 0.05;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.vx *= 0.98;
      this.alpha -= this.decay;
    }

    draw() {
      if (!fwCtx) return;
      fwCtx.save();
      fwCtx.globalAlpha = Math.max(0, this.alpha);
      fwCtx.fillStyle = this.color;
      fwCtx.shadowBlur = 8;
      fwCtx.shadowColor = this.color;
      fwCtx.beginPath();
      fwCtx.arc(this.x, this.y, 2.2, 0, Math.PI * 2);
      fwCtx.fill();
      fwCtx.restore();
    }
  }

  function launchFirework() {
    if (!fireworksCanvas) return;
    const x = Math.random() * fireworksCanvas.width;
    const y = Math.random() * (fireworksCanvas.height * 0.55) + 30;
    const colors = ['#FFD700', '#FF69B4', '#FF1493', '#FFF', '#81D4FA'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < 30; i++) {
      fwParticles.push(new FireworkParticle(x, y, chosenColor));
    }
  }

  function loopFireworks() {
    if (!fireworksRunning || !fwCtx) return;
    fwCtx.fillStyle = 'rgba(15, 5, 29, 0.2)';
    fwCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    if (Math.random() < 0.08) launchFirework();

    for (let idx = fwParticles.length - 1; idx >= 0; idx--) {
      const p = fwParticles[idx];
      p.update();
      p.draw();
      if (p.alpha <= 0) fwParticles.splice(idx, 1);
    }

    requestAnimationFrame(loopFireworks);
  }

  function startFireworks() {
    if (fireworksRunning) return;
    fireworksRunning = true;
    resizeFireworks();
    loopFireworks();
  }

  /* --------------------------------------------------------------------------
     18. TASK 3: TANGLED WISH LANTERNS
     -------------------------------------------------------------------------- */
  const userWishInput = document.getElementById('userWishInput');
  const releaseWishBtn = document.getElementById('releaseWishBtn');
  const wishSuccessNote = document.getElementById('wishSuccessNote');
  const activeLanternsStage = document.getElementById('activeLanternsStage');

  if (releaseWishBtn) {
    releaseWishBtn.addEventListener('click', () => {
      const wishText = userWishInput && userWishInput.value.trim() !== ''
        ? userWishInput.value.trim()
        : 'A lifetime of infinite smiles & hugs 💕';

      SoundFX.playChime();
      if (navigator.vibrate) navigator.vibrate([30, 20, 30]);

      if (activeLanternsStage) {
        const lantern = document.createElement('div');
        lantern.className = 'floating-sky-lantern';
        lantern.innerHTML = `<span class="lantern-wish-tag">${wishText.substring(0, 35)}...</span>`;
        activeLanternsStage.appendChild(lantern);

        setTimeout(() => lantern.remove(), 4200);
      }

      if (wishSuccessNote) {
        wishSuccessNote.style.display = 'block';
        wishSuccessNote.textContent = `✨ "${wishText}" has flown to the stars, Princess! 💖`;
      }
      if (userWishInput) userWishInput.value = '';

      if (window.confetti) {
        window.confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#FFD54F', '#FFB300', '#FFF']
        });
      }
    });
  }

  /* --------------------------------------------------------------------------
     19. TASK 4: ROYAL PIGEON LOVE LETTER & FOREVER PROPOSAL
     -------------------------------------------------------------------------- */
  const royalWaxSealBtn = document.getElementById('royalWaxSealBtn');
  const envelopeFlap = document.getElementById('envelopeFlap');
  const parchmentScroll = document.getElementById('parchmentScroll');
  const parchmentLetterText = document.getElementById('parchmentLetterText');
  const quillCursor = document.getElementById('quillCursor');
  const proposalArena = document.getElementById('proposalArena');
  const proposalYesBtn = document.getElementById('proposalYesBtn');
  const proposalNoBtn = document.getElementById('proposalNoBtn');
  const proposalButtonsWrap = document.getElementById('proposalButtonsWrap');
  const proposalCelebrationModal = document.getElementById('proposalCelebrationModal');
  const closeProposalModalBtn = document.getElementById('closeProposalModalBtn');

  let letterUnrolled = false;

  const letterContent = 
`Happy Birthday to the most amazing girl in my universe!

From the first day you walked into my life, everything became so much brighter, calmer, and more meaningful. Your smile has a special way of melting away all my stress, and your laugh is my absolute favorite sound in the whole world.

I love every little thing about you. The sweet way your eyes light up whenever you see ice cream. The cute, dramatic little pouts you make whenever you are annoyed with me. The gentle way you admire fresh white lilies, your favorite flowers. You are pure, precious, and irreplaceable.

Today, on your birthday, I want to make you a few promises:
I promise to always be your safe haven and your biggest cheerleader.
I promise to bring you midnight ice cream whenever you crave it.
I promise to hold your hand through every chapter of life.
And above all, I promise to love you more with every single passing day.

Thank you for choosing me and for filling my life with your light.
Happy Birthday, my beautiful Princess.

Forever yours,
Himanshu ❤️`;

  function typeLetterText() {
    if (!parchmentLetterText) return;
    parchmentLetterText.textContent = '';
    let charIndex = 0;

    const typingInterval = setInterval(() => {
      if (charIndex < letterContent.length) {
        parchmentLetterText.textContent += letterContent.charAt(charIndex);
        charIndex++;

        // Auto-scroll parchment paper as it types
        const parchmentPaper = parchmentScroll ? parchmentScroll.querySelector('.vintage-parchment-paper') : null;
        if (parchmentPaper && charIndex % 15 === 0) {
          parchmentPaper.scrollTop = parchmentPaper.scrollHeight;
        }
      } else {
        clearInterval(typingInterval);
        if (quillCursor) quillCursor.style.display = 'none';
        if (proposalArena) proposalArena.style.display = 'block';

        const parchmentPaper = parchmentScroll ? parchmentScroll.querySelector('.vintage-parchment-paper') : null;
        if (parchmentPaper) {
          parchmentPaper.scrollTo({ top: parchmentPaper.scrollHeight, behavior: 'smooth' });
        }
      }
    }, 24);
  }

  function openRoyalLetter() {
    if (letterUnrolled) return;
    letterUnrolled = true;

    SoundFX.playChime();
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);

    if (royalWaxSealBtn) {
      royalWaxSealBtn.style.animation = 'none';
      royalWaxSealBtn.style.transform = 'scale(0)';
      royalWaxSealBtn.style.opacity = '0';
    }

    if (envelopeFlap) {
      envelopeFlap.style.transform = 'rotateX(180deg)';
    }

    setTimeout(() => {
      if (parchmentScroll) parchmentScroll.style.display = 'block';
      typeLetterText();
      startFireworks();
    }, 450);
  }

  if (royalWaxSealBtn) {
    royalWaxSealBtn.addEventListener('click', openRoyalLetter);
  }

  // "No" Button Dodges Away (She can never say no!)
  function dodgeProposalNo() {
    if (!proposalNoBtn || !proposalButtonsWrap) return;
    const wrapRect = proposalButtonsWrap.getBoundingClientRect();
    const btnRect = proposalNoBtn.getBoundingClientRect();

    const maxX = Math.max(20, (wrapRect.width - btnRect.width) / 2);
    const maxY = 35;
    const randX = (Math.random() - 0.5) * maxX * 1.8;
    const randY = (Math.random() - 0.5) * maxY * 1.8;

    proposalNoBtn.style.transform = `translate(${randX}px, ${randY}px)`;
    SoundFX.playKissPop();
    if (navigator.vibrate) navigator.vibrate(20);
  }

  if (proposalNoBtn) {
    proposalNoBtn.addEventListener('mouseover', dodgeProposalNo);
    proposalNoBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      dodgeProposalNo();
    }, { passive: false });
  }

  // "Yes" Button Triggers Proposal Victory
  if (proposalYesBtn) {
    proposalYesBtn.addEventListener('click', () => {
      SoundFX.playChime();
      if (navigator.vibrate) navigator.vibrate([50, 40, 50, 40]);

      if (window.confetti) {
        window.confetti({
          particleCount: 130,
          spread: 120,
          origin: { y: 0.55 },
          colors: ['#E91E63', '#FFD700', '#FF4081', '#FFFFFF']
        });
      }

      setTimeout(() => {
        if (proposalCelebrationModal) proposalCelebrationModal.classList.add('active');
      }, 350);
    });
  }

  if (closeProposalModalBtn) {
    closeProposalModalBtn.addEventListener('click', () => {
      if (proposalCelebrationModal) proposalCelebrationModal.classList.remove('active');
    });
  }

  /* --------------------------------------------------------------------------
     20. BIDIRECTIONAL AUDIO OBSERVER (HIGH PRECISION)
     -------------------------------------------------------------------------- */
  const birthdayCakeStage = document.getElementById('birthdayCakeStage');
  const grandFinaleSection = document.getElementById('grandFinaleSection');
  const wishLanternsSection = document.getElementById('wishLanternsSection');
  const royalLetterSection = document.getElementById('royalLetterSection');

  function checkBirthdaySectionAudio() {
    // If inside cake stage, wish lanterns, or royal letter: switch to birthday song
    const cakeRect = birthdayCakeStage ? birthdayCakeStage.getBoundingClientRect() : null;
    const finaleRect = grandFinaleSection ? grandFinaleSection.getBoundingClientRect() : null;
    const lanternRect = wishLanternsSection ? wishLanternsSection.getBoundingClientRect() : null;
    const letterRect = royalLetterSection ? royalLetterSection.getBoundingClientRect() : null;

    const viewH = window.innerHeight;

    const inCake = cakeRect && cakeRect.top <= viewH * 0.75 && cakeRect.bottom >= viewH * 0.25;
    const inFinale = finaleRect && finaleRect.top <= viewH * 0.75 && finaleRect.bottom >= viewH * 0.25;
    const inLantern = lanternRect && lanternRect.top <= viewH * 0.75 && lanternRect.bottom >= viewH * 0.25;
    const inLetter = letterRect && letterRect.top <= viewH * 0.75 && letterRect.bottom >= viewH * 0.25;

    const inBirthdayZone = inCake || inFinale || inLantern || inLetter;

    if (inBirthdayZone) {
      if (!isInBirthdaySection) {
        switchToBirthdayTrack();
        startFireworks();
      }
    } else {
      if (isInBirthdaySection) {
        switchToRomanticTrack();
      }
    }
  }

  const finaleObserver = new IntersectionObserver(() => {
    checkBirthdaySectionAudio();
  }, {
    threshold: [0.05, 0.2, 0.5, 0.8]
  });

  if (birthdayCakeStage) finaleObserver.observe(birthdayCakeStage);
  if (grandFinaleSection) finaleObserver.observe(grandFinaleSection);
  if (wishLanternsSection) finaleObserver.observe(wishLanternsSection);
  if (royalLetterSection) finaleObserver.observe(royalLetterSection);

  window.addEventListener('scroll', checkBirthdaySectionAudio, { passive: true });

  /* --------------------------------------------------------------------------
     21. ROMANTIC VIDEO REELS ZONE (Cloudinary Hosted & Touch Swiper)
     -------------------------------------------------------------------------- */
  const videoSwiperTrack = document.getElementById('videoSwiperTrack');
  const videoSlides = document.querySelectorAll('.video-slide');
  const reelVideos = document.querySelectorAll('.reel-video');
  const videoPrevBtn = document.getElementById('videoPrevBtn');
  const videoNextBtn = document.getElementById('videoNextBtn');
  const carouselDots = document.querySelectorAll('.carousel-dot');
  const videoCarousel = document.getElementById('videoCarousel');

  let currentSlideIndex = 0;
  const totalSlides = videoSlides.length || 4;

  function updateVideoSlide(newIndex, autoPlayNext = false) {
    // 1. Pause any currently playing reel video
    reelVideos.forEach(v => {
      if (!v.paused) v.pause();
    });

    // 2. Wrap around indices
    currentSlideIndex = (newIndex + totalSlides) % totalSlides;

    // 3. Transform swiper track
    if (videoSwiperTrack) {
      videoSwiperTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }

    // 4. Update slide classes
    videoSlides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentSlideIndex);
    });

    // 5. Update pagination dots
    carouselDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlideIndex);
    });

    // 6. If requested, automatically start playing the new video
    if (autoPlayNext && reelVideos[currentSlideIndex]) {
      const nextVid = reelVideos[currentSlideIndex];
      nextVid.currentTime = 0;
      nextVid.play().catch(e => console.log('Autoplay next video:', e));
    }
  }

  if (videoPrevBtn) {
    videoPrevBtn.addEventListener('click', () => {
      updateVideoSlide(currentSlideIndex - 1);
    });
  }

  if (videoNextBtn) {
    videoNextBtn.addEventListener('click', () => {
      updateVideoSlide(currentSlideIndex + 1);
    });
  }

  carouselDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      updateVideoSlide(idx);
    });
  });

  // Reel Video Event Listeners (Audio Coordination & Auto-Next)
  reelVideos.forEach((video, idx) => {
    video.addEventListener('ended', () => {
      updateVideoSlide(idx + 1, true);
    });

    video.addEventListener('play', () => {
      reelVideos.forEach((other, oIdx) => {
        if (oIdx !== idx && !other.paused) {
          other.pause();
        }
      });

      if (isPlaying) {
        currentAudio.pause();
        musicDisc.classList.remove('playing');
        musicBtnIcon.className = 'fa-solid fa-play';
        musicStatus.textContent = 'Paused for Reel 🎬';
      }
    });

    video.addEventListener('pause', () => {
      setTimeout(() => {
        if (!isVideoReelPlaying() && isPlaying) {
          currentAudio.play().then(() => {
            musicDisc.classList.add('playing');
            musicBtnIcon.className = 'fa-solid fa-pause';
            musicStatus.textContent = isInBirthdaySection ? 'Birthday Song 🎂' : 'Playing Romantic Song 🎵';
          }).catch(e => console.log('Music resume issue:', e));
        }
      }, 350);
    });
  });

  // Touch Swipe Gesture Detection on Carousel
  if (videoCarousel) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isTouchSwiping = false;

    videoCarousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
      isTouchSwiping = true;
    }, { passive: true });

    videoCarousel.addEventListener('touchmove', (e) => {
      if (!isTouchSwiping) return;
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
    }, { passive: true });

    videoCarousel.addEventListener('touchend', (e) => {
      if (!isTouchSwiping) return;
      isTouchSwiping = false;
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;

      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
        if (diffX < 0) updateVideoSlide(currentSlideIndex + 1);
        else updateVideoSlide(currentSlideIndex - 1);
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     22. "MAKE A WISH" WAND BUTTON
     -------------------------------------------------------------------------- */
  const wishWandBtn = document.getElementById('wishWandBtn');
  const shootingStarContainer = document.getElementById('shootingStarContainer');

  if (wishWandBtn) {
    wishWandBtn.addEventListener('click', () => {
      SoundFX.playChime();
      if (navigator.vibrate) navigator.vibrate(25);

      if (shootingStarContainer) {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        star.style.top = `${Math.random() * 30 + 10}vh`;
        star.style.left = `${Math.random() * 30 + 10}vw`;
        shootingStarContainer.appendChild(star);

        setTimeout(() => star.remove(), 1300);
      }

      alert("✨ Close your eyes, Princess Samikshaaaa! ✨\n\nMake a wish from the bottom of your heart. The universe, the lilies, and your boyfriend are listening! 🌸💖");
    });
  }

});
