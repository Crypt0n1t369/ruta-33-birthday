const modal = document.querySelector('#massageModal');
const passwordModal = document.querySelector('#passwordModal');
const couponModal = document.querySelector('#couponModal');
const passwordForm = document.querySelector('#passwordForm');
const passwordConfirmation = document.querySelector('#passwordConfirmation');
const form = document.querySelector('#massageForm');
const confirmation = document.querySelector('#confirmation');
const happyAddon = document.querySelector('#happyAddon');
const customZone = form.querySelector('textarea[name="customZone"]');
const zoneInputs = [...form.querySelectorAll('input[name="zones"]')];
const bgMusic = document.querySelector('#bgMusic');
const musicToggle = document.querySelector('[data-music-toggle]');

const focusModal = target => {
  const focusable = target.querySelector('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
  setTimeout(() => focusable?.focus(), 60);
};
const unlockScrollIfAllClosed = () => {
  const anyOpen = [modal, passwordModal, couponModal].some(item => item.getAttribute('aria-hidden') === 'false');
  if (!anyOpen) document.body.style.overflow = '';
};
const openModal = () => {
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  focusModal(modal);
  burstHearts(28);
};
const closeModal = () => {
  modal.setAttribute('aria-hidden', 'true');
  unlockScrollIfAllClosed();
};
const openPasswordModal = () => {
  passwordModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  focusModal(passwordModal);
};
const closePasswordModal = () => {
  passwordModal.setAttribute('aria-hidden', 'true');
  unlockScrollIfAllClosed();
};
const openCouponModal = () => {
  couponModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  focusModal(couponModal);
  confettiBurst();
};
const closeCouponModal = () => {
  couponModal.setAttribute('aria-hidden', 'true');
  unlockScrollIfAllClosed();
};

const normalize = value => value.toLocaleLowerCase('lv-LV').trim();

if (bgMusic && musicToggle) {
  bgMusic.volume = 0.34;
  musicToggle.addEventListener('click', async () => {
    try {
      if (bgMusic.paused) {
        await bgMusic.play();
        musicToggle.textContent = '❚❚ apturēt Liepājas fonu';
        musicToggle.setAttribute('aria-pressed', 'true');
      } else {
        bgMusic.pause();
        musicToggle.textContent = '♪ ieslēgt Liepājas fonu';
        musicToggle.setAttribute('aria-pressed', 'false');
      }
    } catch {
      musicToggle.textContent = '♪ pieskaries vēlreiz, lai ieslēgtu';
    }
  });
}

document.querySelectorAll('[data-open-gift]').forEach(btn => btn.addEventListener('click', openPasswordModal));
document.querySelectorAll('[data-open-massage]').forEach(btn => btn.addEventListener('click', openModal));
document.querySelectorAll('[data-close-massage]').forEach(btn => btn.addEventListener('click', closeModal));
document.querySelectorAll('[data-close-password]').forEach(btn => btn.addEventListener('click', closePasswordModal));
document.querySelectorAll('[data-close-coupon]').forEach(btn => btn.addEventListener('click', closeCouponModal));
document.querySelectorAll('[data-claim-gift]').forEach(btn => btn.addEventListener('click', () => {
  closeCouponModal();
  openModal();
}));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closePasswordModal();
    closeCouponModal();
  }
});

passwordForm.addEventListener('submit', e => {
  e.preventDefault();
  const answer = normalize(passwordForm.elements.giftPassword.value);
  if (answer === 'sasaldēti' || answer === 'saldēti') {
    passwordConfirmation.textContent = 'Pareizi. Protams, ka auksti. Kristaps apstiprina šo dīvainību.';
    setTimeout(() => {
      closePasswordModal();
      openCouponModal();
    }, 650);
  } else {
    passwordConfirmation.textContent = 'Gandrīz, bet nē. Padomā aukstāk.';
  }
});

const secretCta = document.querySelector('#secretCta');
if (secretCta) {
  const cover = secretCta.querySelector('.secret-cover');
  const progress = secretCta.querySelector('.secret-progress');
  const reveal = () => {
    if (secretCta.classList.contains('revealed')) return;
    secretCta.classList.add('revealed');
    secretCta.querySelector('.secret-reveal').setAttribute('aria-hidden', 'false');
    initScratchCard();
    burstHearts(16);
  };
  const HOLD_MS = 5000;
  const RUB_MS = 3000;
  let holdStarted = 0;
  let rubMs = 0;
  let lastRubAt = 0;
  let holdTimer;
  const paint = () => {
    const holdPct = holdStarted ? (Date.now() - holdStarted) / HOLD_MS : 0;
    const rubPct = rubMs / RUB_MS;
    progress.style.transform = `scaleX(${Math.min(Math.max(holdPct, rubPct), 1)})`;
    if (holdPct >= 1 || rubPct >= 1) reveal();
  };
  cover.addEventListener('pointerdown', e => {
    cover.setPointerCapture?.(e.pointerId);
    cover.classList.add('touching');
    holdStarted = Date.now();
    rubMs = 0;
    lastRubAt = 0;
    holdTimer = setInterval(() => {
      if (lastRubAt && Date.now() - lastRubAt < 180) rubMs = Math.min(RUB_MS, rubMs + 120);
      paint();
    }, 120);
  });
  cover.addEventListener('pointermove', e => {
    if (!cover.classList.contains('touching')) return;
    const movement = Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
    if (movement > 3) lastRubAt = Date.now();
    paint();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => cover.addEventListener(evt, () => {
    cover.classList.remove('touching');
    holdStarted = 0;
    rubMs = 0;
    lastRubAt = 0;
    progress.style.transform = 'scaleX(0)';
    clearInterval(holdTimer);
  }));
  cover.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      reveal();
    }
  });
}

function initScratchCard() {
  const card = document.querySelector('#scratchCard');
  const canvas = card?.querySelector('.scratch-layer');
  if (!card || !canvas || canvas.dataset.ready) return;
  canvas.dataset.ready = 'true';
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let scratching = false;
  let revealed = false;

  const drawCover = () => {
    const rect = card.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    g.addColorStop(0, '#7a2f44');
    g.addColorStop(.52, '#d98989');
    g.addColorStop(1, '#bf8d41');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = 'rgba(255,255,255,.2)';
    for (let i = 0; i < 70; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * rect.width, Math.random() * rect.height, 1 + Math.random() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.font = '800 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NOKASI, LAI ATVĒRTU', rect.width / 2, rect.height / 2);
  };

  const finishScratch = () => {
    if (revealed) return;
    revealed = true;
    card.classList.add('scratched');
    canvas.style.pointerEvents = 'none';
    burstHearts(14);
  };

  const clearedRatio = () => {
    const w = canvas.width, h = canvas.height;
    const data = ctx.getImageData(0, 0, w, h).data;
    let clear = 0;
    for (let i = 3; i < data.length; i += 28) if (data[i] < 40) clear++;
    return clear / (data.length / 28 / 4);
  };

  const scratch = e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    if (clearedRatio() > .58) finishScratch();
  };

  drawCover();
  canvas.addEventListener('pointerdown', e => {
    scratching = true;
    canvas.setPointerCapture?.(e.pointerId);
    scratch(e);
  });
  canvas.addEventListener('pointermove', e => {
    if (scratching) scratch(e);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => canvas.addEventListener(evt, () => scratching = false));
}


function selectedZones() {
  const zones = zoneInputs.filter(input => input.checked && input.value !== 'custom').map(input => input.value);
  const customChecked = zoneInputs.some(input => input.checked && input.value === 'custom');
  const custom = customZone.value.trim();
  if (customChecked && custom) zones.push(`citur: ${custom}`);
  return zones;
}
function updateHappyEndingVisibility() {
  const customChecked = zoneInputs.some(input => input.checked && input.value === 'custom');
  customZone.hidden = !customChecked;
  if (!customChecked) customZone.value = '';
  const zones = selectedZones();
  happyAddon.hidden = zones.length === 0;
  if (zones.length === 0) {
    form.elements.happyEnding.checked = false;
    confirmation.textContent = '';
    return;
  }
  happyAddon.querySelector('.addon-question').textContent = `Izvēlēts: ${zones.join(', ')}. Vai komplektā iekļaut arī happy ending?`;
}
zoneInputs.forEach(input => input.addEventListener('change', updateHappyEndingVisibility));
customZone.addEventListener('input', updateHappyEndingVisibility);

form.addEventListener('submit', async e => {
  e.preventDefault();
  const zones = selectedZones();
  if (zones.length === 0) {
    confirmation.textContent = 'Vispirms izvēlies vismaz vienu masāžas zonu.';
    return;
  }
  const happy = form.elements.happyEnding.checked;
  const comment = form.elements.comment.value.trim();
  const booking = { zones, happyEnding: happy, comment, reservedAt: new Date().toISOString() };
  const message = [
    'Sveiks, Kristap. Es rezervēju dzimšanas dienas masāžu 💛',
    `Zonas: ${zones.join(', ')}`,
    happy ? 'Papildu opcija: jā 😇' : 'Papildu opcija: šoreiz vēl nē',
    comment ? `Komentārs: ${comment}` : ''
  ].filter(Boolean).join('\n');
  localStorage.setItem('birthdayMassageChoice', JSON.stringify({ ...booking, message }));
  burstHearts(34);

  const shareUrl = `https://t.me/share/url?url=&text=${encodeURIComponent(message)}`;
  confirmation.innerHTML = `Rezervācija sagatavota: <strong>${zones.join(', ')}</strong>. <a href="${shareUrl}" target="_blank" rel="noopener">Nosūtīt Kristapam Telegramā</a>`;

  try {
    if (navigator.share) {
      await navigator.share({ title: 'Masāžas rezervācija Kristapam', text: message });
      confirmation.innerHTML = `Nosūtīts / sagatavots nosūtīšanai. Kristapam jāsaņem šī izvēle: <strong>${zones.join(', ')}</strong>.`;
      burstHearts(18);
      return;
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(message);
      confirmation.innerHTML = `Rezervācija nokopēta. <a href="${shareUrl}" target="_blank" rel="noopener">Atvērt Telegram un nosūtīt Kristapam</a>`;
    }
  } catch {
    confirmation.innerHTML = `Rezervācija sagatavota. <a href="${shareUrl}" target="_blank" rel="noopener">Atvērt Telegram un nosūtīt Kristapam</a>`;
  }
});

const io = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) entry.target.classList.add('visible');
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

function confettiBurst(count = 70) {
  for (let i = 0; i < count; i++) {
    const c = document.createElement('span');
    c.textContent = ['✦', '♡', '•', '❦', '✧'][Math.floor(Math.random() * 5)];
    Object.assign(c.style, {
      position: 'fixed', left: 50 + (Math.random() * 16 - 8) + 'vw', top: '42vh', zIndex: 35,
      color: ['#7a2f44', '#d98989', '#bf8d41', '#65776a'][Math.floor(Math.random() * 4)],
      fontSize: (14 + Math.random() * 20) + 'px', pointerEvents: 'none',
      transition: 'transform 1.7s cubic-bezier(.16,.84,.28,1), opacity 1.7s ease'
    });
    document.body.appendChild(c);
    requestAnimationFrame(() => {
      c.style.transform = `translate(${(Math.random() - .5) * 92}vw, ${-180 - Math.random() * 260}px) rotate(${Math.random() * 540 - 270}deg)`;
      c.style.opacity = '0';
    });
    setTimeout(() => c.remove(), 1800);
  }
}

function burstHearts(count = 24) {
  for (let i = 0; i < count; i++) {
    const h = document.createElement('span');
    h.textContent = ['♡', '✦', '❦', '☾'][Math.floor(Math.random() * 4)];
    Object.assign(h.style, {
      position: 'fixed', left: Math.random() * 100 + 'vw', top: '100vh', zIndex: 30,
      color: ['#7a2f44', '#d98989', '#bf8d41'][Math.floor(Math.random() * 3)],
      fontSize: (18 + Math.random() * 24) + 'px', pointerEvents: 'none',
      transition: 'transform 1.4s ease, opacity 1.4s ease'
    });
    document.body.appendChild(h);
    requestAnimationFrame(() => {
      h.style.transform = `translateY(-${120 + Math.random() * 360}px) rotate(${Math.random() * 160 - 80}deg)`;
      h.style.opacity = '0';
    });
    setTimeout(() => h.remove(), 1500);
  }
}
