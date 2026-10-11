const song = document.getElementById('song');
const playerToggle = document.getElementById('playerToggle');
const playerIcon = document.getElementById('playerIcon');
const audioStatus = document.getElementById('audioStatus');
const seekBar = document.getElementById('seekBar');
const currentTimeLabel = document.getElementById('currentTime');
const durationLabel = document.getElementById('duration');

function timeLabel(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}
function updatePlayerState() {
  const playing = !song.paused && !song.ended;
  playerIcon.textContent = playing ? 'Ⅱ' : '▶';
  playerToggle.setAttribute('aria-label', playing ? 'Pause Darkhaast' : 'Play Darkhaast');
  audioStatus.textContent = playing ? 'NOW PLAYING' : (song.currentTime > 0 ? 'PAUSED' : 'BIRTHDAY PLAYLIST');
}
async function startMusic() {
  try {
    await song.play();
    updatePlayerState();
  } catch (error) {
    // Browsers can block sound autoplay until the visitor interacts with the page.
    updatePlayerState();
    audioStatus.textContent = 'TAP TO PLAY';
  }
}
playerToggle.addEventListener('click', async () => {
  if (song.paused) {
    await startMusic();
  } else {
    song.pause();
    updatePlayerState();
  }
});

// Browsers generally block sound autoplay. Start only after a visitor interacts.
document.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('#playerToggle') && song.paused) startMusic();
}, { once: true, passive: true });
document.addEventListener('keydown', () => {
  if (song.paused) startMusic();
}, { once: true });
song.addEventListener('play', updatePlayerState);
song.addEventListener('pause', updatePlayerState);
song.addEventListener('loadedmetadata', () => { durationLabel.textContent = timeLabel(song.duration); });
song.addEventListener('timeupdate', () => {
  currentTimeLabel.textContent = timeLabel(song.currentTime);
  if (Number.isFinite(song.duration) && song.duration > 0 && !seekBar.matches(':active')) {
    seekBar.value = String((song.currentTime / song.duration) * 100);
  }
});
song.addEventListener('ended', updatePlayerState);
song.addEventListener('error', () => {
  audioStatus.textContent = 'TRACK UNAVAILABLE';
  playerIcon.textContent = '▶';
});
seekBar.addEventListener('input', () => {
  if (Number.isFinite(song.duration) && song.duration > 0) song.currentTime = (Number(seekBar.value) / 100) * song.duration;
});

// Animated 18th-birthday reveal: the number rolls from 17 to 18 when slide two appears.
const ageScreen = document.getElementById('age');
const ageNumber = document.getElementById('ageNumber');
let ageRevealStarted = false;
if (ageScreen && ageNumber) {
  const revealAge = () => {
    if (ageRevealStarted) return;
    ageRevealStarted = true;
    ageNumber.textContent = '17';
    ageNumber.setAttribute('aria-label', '17 changing to 18');
    ageNumber.classList.add('age-number-ready');
    window.setTimeout(() => {
      ageNumber.classList.add('age-number-flipping');
      window.setTimeout(() => {
        ageNumber.textContent = '18';
        ageNumber.setAttribute('aria-label', '18');
        ageNumber.classList.remove('age-number-flipping');
        ageNumber.classList.add('age-number-eighteen');
      }, 360);
    }, 1000);
  };
  if ('IntersectionObserver' in window) {
    const ageObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        revealAge();
        ageObserver.disconnect();
      }
    }, { threshold: 0.35 });
    ageObserver.observe(ageScreen);
  } else {
    window.addEventListener('load', revealAge, { once: true });
  }
}

// Aysha's birthday: countdown updates every second and repeats annually.
const clock = document.getElementById('countdown');
const birthdayLabel = document.querySelector('.ticket-date small');
function updateBirthdayCountdown() {
  const now = new Date();
  const nextBirthday = new Date(now.getFullYear(), 9, 12, 0, 0, 0); // October 12
  const isBirthday = now.getMonth() === 9 && now.getDate() === 12;
  if (isBirthday) {
    clock.textContent = 'IT’S HER DAY!';
    birthdayLabel.textContent = 'HAPPY BIRTHDAY, AYSHA 💗';
    return;
  }
  if (nextBirthday <= now) nextBirthday.setFullYear(now.getFullYear() + 1);
  const distance = Math.max(0, nextBirthday.getTime() - now.getTime());
  const days = Math.floor(distance / 86400000);
  const hours = Math.floor((distance % 86400000) / 3600000);
  const minutes = Math.floor((distance % 3600000) / 60000);
  const seconds = Math.floor((distance % 60000) / 1000);
  const pad = n => String(n).padStart(2, '0');
  clock.textContent = `${pad(days)}D · ${pad(hours)}H · ${pad(minutes)}M`;
  birthdayLabel.textContent = `UNTIL AYSHA’S BIRTHDAY · ${pad(seconds)}S`;
}
updateBirthdayCountdown();
setInterval(updateBirthdayCountdown, 1000);

document.querySelectorAll('[data-next]').forEach(button => {
  button.addEventListener('click', () => {
    if (song.paused) startMusic();
    document.getElementById(button.dataset.next).scrollIntoView({behavior:'smooth'});
  });
});

const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? window.scrollY / max * 100 : 0}%`;
});

document.getElementById('confettiBtn').addEventListener('click', () => {
  const symbols = ['💗','💖','✨','🌸','🎉','♥','🎀'];
  for (let i=0;i<55;i++) {
    const bit = document.createElement('span');
    bit.className = 'confetti';
    bit.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    bit.style.left = Math.random()*100 + 'vw';
    bit.style.animationDelay = Math.random()*1.4 + 's';
    bit.style.fontSize = (14 + Math.random()*20) + 'px';
    document.body.appendChild(bit);
    setTimeout(() => bit.remove(), 5000);
  }
  document.getElementById('confettiBtn').textContent = 'Wish sent to the universe ✨';
});
