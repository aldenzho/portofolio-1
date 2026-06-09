// ==========================================================================
// STATE & DATA
// ==========================================================================
let portfolioData = {
  personal: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    photo: null
  },
  bio: '',
  skills: [],
  experience: [],
  projects: [],
  social: []
};

// Audio context for typing sounds
let audioCtx = null;
let soundEnabled = true;

// Canvas animation
let canvas, ctx;
let canvasAnimType = 'particles';
let particlesArray = [];
let matrixColumns = [];
let animFrameId = null;
let mouse = { x: null, y: null, radius: 100 };

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  renderAllBuilderLists();
  updateLivePreview();
  initTabNavigation();
  initFormBindings();
  initPhotoUpload();
  initThemeSelection();
  initTerminal();
  initScrollSpy();
  initScrollReveal();
  initCanvas();

  // Restore saved theme
  const savedTheme = localStorage.getItem('portfolioTheme') || 'synthwave';
  applyTheme(savedTheme);

  // Set footer year
  document.getElementById('footerYear').textContent = new Date().getFullYear();

  logToTerminal('IDE siap. Ketik help untuk daftar perintah.', 'SYSTEM');
});

// ==========================================================================
// AUDIO EFFECTS
// ==========================================================================
function playKeySound() {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420 + Math.random() * 280, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.04);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {}
}

function playSuccessSound() {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    let now = audioCtx.currentTime;
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(523, now);
    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {}
}

// ==========================================================================
// TAB NAVIGATION
// ==========================================================================
function initTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const formSections = document.querySelectorAll('.form-section');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      formSections.forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
      playKeySound();
    });
  });
}

// ==========================================================================
// FORM INPUT BINDINGS (real-time preview)
// ==========================================================================
function initFormBindings() {
  const fields = ['fullName', 'headline', 'email', 'phone', 'location', 'bio'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        updateDataFromForm();
        updateLivePreview();
        playKeySound();
      });
    }
  });
}

function updateDataFromForm() {
  portfolioData.personal.fullName = document.getElementById('fullName').value;
  portfolioData.personal.headline = document.getElementById('headline').value;
  portfolioData.personal.email = document.getElementById('email').value;
  portfolioData.personal.phone = document.getElementById('phone').value;
  portfolioData.personal.location = document.getElementById('location').value;
  portfolioData.bio = document.getElementById('bio').value;
  saveToLocalStorage();
}

// ==========================================================================
// PHOTO UPLOAD
// ==========================================================================
function initPhotoUpload() {
  document.getElementById('photoInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        portfolioData.personal.photo = evt.target.result;
        showPhotoInBuilder(evt.target.result);
        updateLivePreview();
        saveToLocalStorage();
        logToTerminal('Foto profil berhasil diunggah.', 'UPLOAD');
        playSuccessSound();
      };
      reader.readAsDataURL(file);
    }
  });
}

function showPhotoInBuilder(src) {
  const img = document.getElementById('avatarUploadPreview');
  const placeholder = document.getElementById('avatarPlaceholder');
  const removeBtn = document.getElementById('removePhotoBtn');
  img.src = src;
  img.style.display = 'block';
  placeholder.style.display = 'none';
  removeBtn.style.display = 'block';
}

function removePhoto() {
  portfolioData.personal.photo = null;
  const img = document.getElementById('avatarUploadPreview');
  const placeholder = document.getElementById('avatarPlaceholder');
  const removeBtn = document.getElementById('removePhotoBtn');
  img.style.display = 'none';
  placeholder.style.display = 'flex';
  removeBtn.style.display = 'none';
  document.getElementById('photoInput').value = '';
  updateLivePreview();
  saveToLocalStorage();
}

// ==========================================================================
// SKILLS CRUD
// ==========================================================================
function addSkill() {
  const nameInput = document.getElementById('inputSkillName');
  const levelInput = document.getElementById('inputSkillLevel');
  const name = nameInput.value.trim();
  if (!name) return;
  portfolioData.skills.push({ name, level: levelInput.value });
  nameInput.value = '';
  renderSkillsBuilderList();
  updateLivePreview();
  saveToLocalStorage();
  playKeySound();
  logToTerminal(`Skill ditambahkan: ${name}`, 'EDITOR');
}

function removeSkill(index) {
  portfolioData.skills.splice(index, 1);
  renderSkillsBuilderList();
  updateLivePreview();
  saveToLocalStorage();
  playKeySound();
}

function renderSkillsBuilderList() {
  const container = document.getElementById('skillsList');
  container.innerHTML = '';
  if (portfolioData.skills.length === 0) {
    container.innerHTML = '<p style="font-size:12px; color:var(--builder-text-muted);">Belum ada keahlian. Tambahkan di atas.</p>';
    return;
  }
  portfolioData.skills.forEach((skill, i) => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag-editable';
    tag.innerHTML = `${skill.name} <span class="skill-level-badge">${skill.level}</span> ✕`;
    tag.addEventListener('click', () => removeSkill(i));
    container.appendChild(tag);
  });
}

// Handle enter key in skill input
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('inputSkillName');
  if (el) {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
    });
  }
});

// ==========================================================================
// EXPERIENCE CRUD
// ==========================================================================
function addExperience() {
  portfolioData.experience.push({ id: Date.now(), position: '', company: '', duration: '', description: '' });
  renderExperienceBuilderList();
  updateLivePreview();
  saveToLocalStorage();
  playKeySound();
  logToTerminal('Pengalaman baru ditambahkan.', 'EDITOR');
}

function removeExperience(id) {
  portfolioData.experience = portfolioData.experience.filter(e => e.id !== id);
  renderExperienceBuilderList();
  updateLivePreview();
  saveToLocalStorage();
  playKeySound();
}

function renderExperienceBuilderList() {
  const container = document.getElementById('experienceList');
  container.innerHTML = '';
  if (portfolioData.experience.length === 0) {
    container.innerHTML = '<p style="font-size:12px; color:var(--builder-text-muted); text-align:center; padding:10px;">Belum ada pengalaman.</p>';
    return;
  }
  portfolioData.experience.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'list-item';
    card.innerHTML = `
      <button type="button" class="btn-remove" onclick="removeExperience(${exp.id})">Hapus</button>
      <div class="form-group">
        <label>Posisi / Role</label>
        <input type="text" value="${exp.position || ''}" data-id="${exp.id}" data-field="position" class="exp-input">
      </div>
      <div class="row-2">
        <div class="form-group">
          <label>Perusahaan</label>
          <input type="text" value="${exp.company || ''}" data-id="${exp.id}" data-field="company" class="exp-input">
        </div>
        <div class="form-group">
          <label>Periode</label>
          <input type="text" value="${exp.duration || ''}" data-id="${exp.id}" data-field="duration" class="exp-input" placeholder="2023 - Sekarang">
        </div>
      </div>
      <div class="form-group">
        <label>Deskripsi</label>
        <textarea data-id="${exp.id}" data-field="description" class="exp-input" rows="3">${exp.description || ''}</textarea>
      </div>
    `;
    card.querySelectorAll('.exp-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const item = portfolioData.experience.find(x => x.id === exp.id);
        if (item) { item[e.target.dataset.field] = e.target.value; updateLivePreview(); saveToLocalStorage(); }
      });
    });
    container.appendChild(card);
  });
}

// ==========================================================================
// PROJECTS CRUD
// ==========================================================================
function addProject() {
  portfolioData.projects.push({ id: Date.now(), title: '', description: '', tech: [], link: '' });
  renderProjectsBuilderList();
  updateLivePreview();
  saveToLocalStorage();
  playKeySound();
  logToTerminal('Projek baru ditambahkan.', 'EDITOR');
}

function removeProject(id) {
  portfolioData.projects = portfolioData.projects.filter(p => p.id !== id);
  renderProjectsBuilderList();
  updateLivePreview();
  saveToLocalStorage();
  playKeySound();
}

function renderProjectsBuilderList() {
  const container = document.getElementById('projectsList');
  container.innerHTML = '';
  if (portfolioData.projects.length === 0) {
    container.innerHTML = '<p style="font-size:12px; color:var(--builder-text-muted); text-align:center; padding:10px;">Belum ada projek.</p>';
    return;
  }
  portfolioData.projects.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'list-item';
    card.innerHTML = `
      <button type="button" class="btn-remove" onclick="removeProject(${proj.id})">Hapus</button>
      <div class="form-group">
        <label>Judul Projek</label>
        <input type="text" value="${proj.title || ''}" data-id="${proj.id}" data-field="title" class="proj-input">
      </div>
      <div class="form-group">
        <label>Deskripsi</label>
        <textarea data-id="${proj.id}" data-field="description" class="proj-input" rows="3">${proj.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Tech Stack (pisah koma)</label>
        <input type="text" value="${(proj.tech || []).join(', ')}" data-id="${proj.id}" data-field="tech" class="proj-input">
      </div>
      <div class="form-group">
        <label>Link (opsional)</label>
        <input type="url" value="${proj.link || ''}" data-id="${proj.id}" data-field="link" class="proj-input">
      </div>
    `;
    card.querySelectorAll('.proj-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const item = portfolioData.projects.find(x => x.id === proj.id);
        if (item) {
          if (e.target.dataset.field === 'tech') {
            item.tech = e.target.value.split(',').map(t => t.trim()).filter(t => t);
          } else {
            item[e.target.dataset.field] = e.target.value;
          }
          updateLivePreview();
          saveToLocalStorage();
        }
      });
    });
    container.appendChild(card);
  });
}

// ==========================================================================
// SOCIAL MEDIA CRUD
// ==========================================================================
function addSocial() {
  portfolioData.social.push({ id: Date.now(), platform: '', url: '' });
  renderSocialBuilderList();
  updateLivePreview();
  saveToLocalStorage();
  playKeySound();
  logToTerminal('Social link ditambahkan.', 'EDITOR');
}

function removeSocial(id) {
  portfolioData.social = portfolioData.social.filter(s => s.id !== id);
  renderSocialBuilderList();
  updateLivePreview();
  saveToLocalStorage();
  playKeySound();
}

function renderSocialBuilderList() {
  const container = document.getElementById('socialList');
  container.innerHTML = '';
  if (portfolioData.social.length === 0) {
    container.innerHTML = '<p style="font-size:12px; color:var(--builder-text-muted); text-align:center; padding:10px;">Belum ada tautan sosial.</p>';
    return;
  }
  portfolioData.social.forEach(s => {
    const card = document.createElement('div');
    card.className = 'list-item';
    card.innerHTML = `
      <button type="button" class="btn-remove" onclick="removeSocial(${s.id})">Hapus</button>
      <div class="row-2">
        <div class="form-group">
          <label>Platform</label>
          <input type="text" value="${s.platform || ''}" data-id="${s.id}" data-field="platform" class="social-input" placeholder="GitHub">
        </div>
        <div class="form-group">
          <label>URL</label>
          <input type="url" value="${s.url || ''}" data-id="${s.id}" data-field="url" class="social-input" placeholder="https://...">
        </div>
      </div>
    `;
    card.querySelectorAll('.social-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const item = portfolioData.social.find(x => x.id === s.id);
        if (item) { item[e.target.dataset.field] = e.target.value; updateLivePreview(); saveToLocalStorage(); }
      });
    });
    container.appendChild(card);
  });
}

// ==========================================================================
// RENDER ALL BUILDER LISTS
// ==========================================================================
function renderAllBuilderLists() {
  renderSkillsBuilderList();
  renderExperienceBuilderList();
  renderProjectsBuilderList();
  renderSocialBuilderList();

  // Restore photo
  if (portfolioData.personal.photo) {
    showPhotoInBuilder(portfolioData.personal.photo);
  }
}

// ==========================================================================
// LIVE PREVIEW UPDATE (Target specific elements — fast)
// ==========================================================================
function updateLivePreview() {
  const { personal, bio, skills, experience, projects, social } = portfolioData;
  const theme = document.getElementById('portfolioThemeWrapper').getAttribute('data-theme');

  // 1. Name, Title, Bio
  document.getElementById('previewName').textContent = personal.fullName || 'Nama Anda';
  document.getElementById('previewTitle').textContent = personal.headline || 'Headline / Profesional Anda';
  const bioText = bio || 'Tulis bio singkat Anda di panel editor sebelah kiri.';
  document.getElementById('previewBioShort').textContent = bioText.length > 140 ? bioText.substring(0, 140) + '...' : bioText;
  document.getElementById('previewBioFull').textContent = bioText;
  document.getElementById('previewLocation').textContent = personal.location || 'Kota Anda';
  document.getElementById('previewEmail').textContent = personal.email || 'email@anda.com';
  document.getElementById('previewPhone').textContent = personal.phone || '+62 xxx';
  document.getElementById('previewContactEmail').textContent = personal.email || 'email@anda.com';
  document.getElementById('previewContactPhone').textContent = personal.phone || '+62 xxx';
  document.getElementById('footerName').textContent = personal.fullName || 'Nama Anda';

  // 2. Avatar
  const previewAvatar = document.getElementById('previewAvatar');
  const avatarPlaceholder = document.getElementById('avatarFramePlaceholder');
  if (personal.photo) {
    previewAvatar.src = personal.photo;
    previewAvatar.style.display = 'block';
    avatarPlaceholder.style.display = 'none';
  } else {
    previewAvatar.style.display = 'none';
    avatarPlaceholder.style.display = 'flex';
  }

  // 3. Social links in hero
  const heroSocials = document.getElementById('previewHeroSocials');
  heroSocials.innerHTML = '';
  social.forEach(s => {
    if (s.platform && s.url) {
      heroSocials.innerHTML += `<a href="${s.url}" target="_blank" class="social-icon-circle">${s.platform}</a>`;
    }
  });

  // 4. Skills grid
  const skillsGrid = document.getElementById('previewSkillsList');
  skillsGrid.innerHTML = '';
  if (skills.length === 0) {
    skillsGrid.innerHTML = '<p class="empty-hint">Belum ada keahlian ditambahkan.</p>';
  } else {
    skills.forEach(skill => {
      const card = document.createElement('div');
      card.className = 'skill-card-glass scroll-reveal revealed';
      card.innerHTML = `
        <span class="skill-icon-sparkle">⚡</span>
        <span class="skill-name-text">${skill.name}</span>
        <span class="skill-level-text">${skill.level}</span>
      `;
      skillsGrid.appendChild(card);
    });
  }

  // 5. Experience timeline
  const timeline = document.getElementById('previewExperienceTimeline');
  timeline.innerHTML = '';
  if (experience.length === 0) {
    timeline.innerHTML = '<p class="empty-hint">Belum ada pengalaman ditambahkan.</p>';
  } else {
    experience.forEach(exp => {
      const item = document.createElement('div');
      item.className = 'timeline-item scroll-reveal revealed';
      item.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-content-card">
          <div class="timeline-meta">
            <div>
              <h3>${exp.position || 'Posisi'}</h3>
              <span class="timeline-company">${exp.company || 'Perusahaan'}</span>
            </div>
            <span class="timeline-period">${exp.duration || 'Periode'}</span>
          </div>
          <p class="timeline-desc">${exp.description || 'Deskripsi pekerjaan.'}</p>
        </div>
      `;
      timeline.appendChild(item);
    });
  }

  // 6. Projects grid
  const projGrid = document.getElementById('previewProjectsGrid');
  projGrid.innerHTML = '';
  if (projects.length === 0) {
    projGrid.innerHTML = '<p class="empty-hint">Belum ada projek ditambahkan.</p>';
  } else {
    projects.forEach(proj => {
      const card = document.createElement('div');
      card.className = 'project-card scroll-reveal revealed';
      let techHTML = '';
      if (proj.tech && proj.tech.length > 0) {
        techHTML = `<div class="project-tech-list">${proj.tech.map(t => `<span class="tech-badge">${t}</span>`).join('')}</div>`;
      }
      card.innerHTML = `
        <div class="project-card-body">
          <h3>${proj.title || 'Judul Projek'}</h3>
          ${techHTML}
          <p>${proj.description || 'Deskripsi projek.'}</p>
          ${proj.link ? `<a href="${proj.link}" target="_blank" class="project-link-btn">Lihat Projek →</a>` : ''}
        </div>
      `;
      projGrid.appendChild(card);
    });
  }
}

// ==========================================================================
// THEME SELECTION
// ==========================================================================
function initThemeSelection() {
  document.querySelectorAll('input[name="theme-select"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      applyTheme(e.target.value);
      playSuccessSound();
    });
  });
}

function applyTheme(theme) {
  document.getElementById('portfolioThemeWrapper').setAttribute('data-theme', theme);
  localStorage.setItem('portfolioTheme', theme);
  // Sync radio button
  const radio = document.querySelector(`input[name="theme-select"][value="${theme}"]`);
  if (radio) radio.checked = true;
  // Refresh particles color
  if (canvasAnimType === 'particles' && particlesArray.length > 0) initParticles();
  logToTerminal(`Tema diubah ke: ${theme.toUpperCase()}`, 'SYSTEM');
}

// ==========================================================================
// FULLSCREEN TOGGLE
// ==========================================================================
function toggleFullscreen() {
  const container = document.getElementById('appContainer');
  container.classList.toggle('preview-only');
  const btn = document.getElementById('btnToggleFullscreen');
  if (container.classList.contains('preview-only')) {
    btn.innerHTML = '🔙 <span>Kembali</span>';
  } else {
    btn.innerHTML = '🖥️ <span>Fullscreen</span>';
  }
}

// Mobile view toggles
function showBuilderMobile() {
  document.body.classList.remove('preview-mode');
  document.body.classList.add('builder-mode');
}

// ==========================================================================
// SCROLL SPY
// ==========================================================================
function initScrollSpy() {
  const scrollContainer = document.getElementById('portfolioScroll');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = scrollContainer.querySelectorAll('.portfolio-section');

  // Navigation link clicks
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Scroll spy
  scrollContainer.addEventListener('scroll', () => {
    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (scrollContainer.scrollTop >= sectionTop - 250) {
        currentId = section.getAttribute('id');
      }
    });
    if (currentId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// ==========================================================================
// SCROLL REVEAL
// ==========================================================================
function initScrollReveal() {
  const scrollContainer = document.getElementById('portfolioScroll');
  const reveal = () => {
    const elements = scrollContainer.querySelectorAll('.scroll-reveal');
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const parentRect = scrollContainer.getBoundingClientRect();
      if (rect.top < parentRect.bottom - 60) {
        el.classList.add('revealed');
      }
    });
  };
  scrollContainer.addEventListener('scroll', reveal);
  // Initial reveal for hero
  setTimeout(reveal, 100);
}

// ==========================================================================
// CANVAS (Particles / Matrix)
// ==========================================================================
function initCanvas() {
  canvas = document.getElementById('background-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const prevSection = document.querySelector('.portfolio-theme-wrapper');
  prevSection.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  prevSection.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  startCanvasAnimation();
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  if (canvasAnimType === 'particles') initParticles();
  else if (canvasAnimType === 'matrix') initMatrix();
}

class Particle {
  constructor(x, y, dx, dy, size, color) {
    this.x = x; this.y = y; this.dx = dx; this.dy = dy; this.size = size; this.color = color;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
    if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;
    if (mouse.x !== null && mouse.y !== null) {
      let dx = mouse.x - this.x, dy = mouse.y - this.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        if (mouse.x < this.x) this.x += 1.5;
        else this.x -= 1.5;
        if (mouse.y < this.y) this.y += 1.5;
        else this.y -= 1.5;
      }
    }
    this.x += this.dx;
    this.y += this.dy;
    this.draw();
  }
}

function initParticles() {
  particlesArray = [];
  let count = Math.min(55, Math.floor((canvas.width * canvas.height) / 12000));
  const cs = getComputedStyle(document.querySelector('.portfolio-theme-wrapper'));
  const color = cs.getPropertyValue('--pf-primary').trim() || '#d946ef';
  for (let i = 0; i < count; i++) {
    let s = Math.random() * 1.8 + 0.6;
    let x = Math.random() * canvas.width;
    let y = Math.random() * canvas.height;
    particlesArray.push(new Particle(x, y, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, s, color));
  }
}

function drawConnections() {
  const cs = getComputedStyle(document.querySelector('.portfolio-theme-wrapper'));
  const linkColor = cs.getPropertyValue('--pf-accent').trim() || '#00f0ff';
  for (let a = 0; a < particlesArray.length; a++) {
    for (let b = a + 1; b < particlesArray.length; b++) {
      let dx = particlesArray[a].x - particlesArray[b].x;
      let dy = particlesArray[a].y - particlesArray[b].y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.strokeStyle = hexToRgba(linkColor, (1 - dist / 100) * 0.1);
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
        ctx.stroke();
      }
    }
  }
}

function hexToRgba(hex, alpha) {
  if (!hex || hex.startsWith('rgba')) return hex || `rgba(0,240,255,${alpha})`;
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function initMatrix() {
  matrixColumns = Array(Math.floor(canvas.width / 14) + 1).fill(1);
}

function renderMatrixRain() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const cs = getComputedStyle(document.querySelector('.portfolio-theme-wrapper'));
  ctx.fillStyle = cs.getPropertyValue('--pf-primary').trim() || '#00ff41';
  ctx.font = '13px monospace';
  const chars = '01{}[]<>#@$+-/*%&ABCDEF'.split('');
  for (let i = 0; i < matrixColumns.length; i++) {
    ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, matrixColumns[i] * 14);
    if (matrixColumns[i] * 14 > canvas.height && Math.random() > 0.98) matrixColumns[i] = 0;
    matrixColumns[i]++;
  }
}

function startCanvasAnimation() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (canvasAnimType === 'none') { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
  if (canvasAnimType === 'particles') initParticles();
  else if (canvasAnimType === 'matrix') initMatrix();
  function loop() {
    if (canvasAnimType === 'particles') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach(p => p.update());
      drawConnections();
    } else if (canvasAnimType === 'matrix') {
      renderMatrixRain();
    }
    animFrameId = requestAnimationFrame(loop);
  }
  loop();
}

// ==========================================================================
// TERMINAL
// ==========================================================================
function initTerminal() {
  const input = document.getElementById('terminalInput');
  if (!input) return;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      if (cmd) executeCommand(cmd);
      input.value = '';
    }
  });
}

function logToTerminal(msg, type = 'SYSTEM') {
  const output = document.getElementById('terminalOutput');
  const scroller = document.getElementById('terminalScroller');
  if (!output) return;
  const line = document.createElement('div');
  line.innerHTML = `<span style="color:var(--builder-text-muted);">[${type}]</span> ${msg}`;
  output.appendChild(line);
  scroller.scrollTop = scroller.scrollHeight;
}

function executeCommand(cmdLine) {
  const output = document.getElementById('terminalOutput');
  const scroller = document.getElementById('terminalScroller');
  // Echo command
  const echo = document.createElement('div');
  echo.innerHTML = `<span style="color:var(--builder-accent);">dev@neon:~$</span> ${cmdLine}`;
  output.appendChild(echo);

  const parts = cmdLine.split(' ');
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ').trim();

  const respond = (text, color) => {
    const line = document.createElement('div');
    line.innerHTML = `<span style="color:${color || 'var(--builder-text)'};">${text}</span>`;
    output.appendChild(line);
    scroller.scrollTop = scroller.scrollHeight;
  };

  switch (cmd) {
    case 'help':
      respond(`Perintah tersedia:
  <span style="color:var(--builder-accent);">help</span>       - Daftar perintah
  <span style="color:var(--builder-accent);">theme</span> &lt;x&gt;  - Ganti tema (synthwave/matrix/dracula/monokai/cyberpunk)
  <span style="color:var(--builder-accent);">matrix</span>     - Animasi Matrix rain
  <span style="color:var(--builder-accent);">particles</span>  - Animasi partikel
  <span style="color:var(--builder-accent);">whoami</span>     - Lihat profil aktif
  <span style="color:var(--builder-accent);">export</span>     - Ekspor JSON
  <span style="color:var(--builder-accent);">clear</span>      - Bersihkan terminal
  <span style="color:var(--builder-accent);">fullscreen</span> - Toggle fullscreen`);
      break;
    case 'clear':
      output.innerHTML = '';
      break;
    case 'theme':
      if (['synthwave','matrix','dracula','monokai','cyberpunk'].includes(arg.toLowerCase())) {
        applyTheme(arg.toLowerCase());
        respond(`✓ Tema diubah ke ${arg.toUpperCase()}`, '#39ff14');
        playSuccessSound();
      } else {
        respond('Tema tidak valid. Gunakan: synthwave, matrix, dracula, monokai, cyberpunk', '#ef4444');
      }
      break;
    case 'matrix':
      canvasAnimType = 'matrix';
      startCanvasAnimation();
      respond('✓ Animasi Matrix Rain aktif', '#39ff14');
      break;
    case 'particles':
      canvasAnimType = 'particles';
      startCanvasAnimation();
      respond('✓ Animasi Partikel aktif', '#39ff14');
      break;
    case 'whoami':
      respond(`Nama: ${portfolioData.personal.fullName || '-'}\nEmail: ${portfolioData.personal.email || '-'}\nLokasi: ${portfolioData.personal.location || '-'}`, 'var(--builder-accent)');
      break;
    case 'export':
      exportJSON();
      respond('✓ JSON berhasil diekspor', '#39ff14');
      break;
    case 'fullscreen':
      toggleFullscreen();
      respond('✓ Fullscreen toggled', '#39ff14');
      break;
    default:
      respond(`Perintah tidak ditemukan: "${cmd}". Ketik "help".`, '#ef4444');
  }
  scroller.scrollTop = scroller.scrollHeight;
}

// ==========================================================================
// LOCAL STORAGE
// ==========================================================================
function saveToLocalStorage() {
  localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('portfolioData');
  if (saved) {
    const parsed = JSON.parse(saved);
    portfolioData = { ...portfolioData, ...parsed };
    // Ensure IDs exist on experience/projects/social
    portfolioData.experience = (portfolioData.experience || []).map(e => ({ id: e.id || Date.now() + Math.random(), ...e }));
    portfolioData.projects = (portfolioData.projects || []).map(p => ({ id: p.id || Date.now() + Math.random(), ...p }));
    portfolioData.social = (portfolioData.social || []).map(s => ({ id: s.id || Date.now() + Math.random(), ...s }));
    
    // Populate form
    document.getElementById('fullName').value = portfolioData.personal.fullName || '';
    document.getElementById('headline').value = portfolioData.personal.headline || '';
    document.getElementById('email').value = portfolioData.personal.email || '';
    document.getElementById('phone').value = portfolioData.personal.phone || '';
    document.getElementById('location').value = portfolioData.personal.location || '';
    document.getElementById('bio').value = portfolioData.bio || '';
  }
}

function clearAllData() {
  if (confirm('Hapus semua data? Tindakan ini tidak bisa dibatalkan.')) {
    portfolioData = {
      personal: { fullName: '', headline: '', email: '', phone: '', location: '', photo: null },
      bio: '',
      skills: [],
      experience: [],
      projects: [],
      social: []
    };
    document.getElementById('portfolioForm').reset();
    removePhoto();
    localStorage.removeItem('portfolioData');
    renderAllBuilderLists();
    updateLivePreview();
    logToTerminal('Semua data berhasil dihapus.', 'SYSTEM');
  }
}

// ==========================================================================
// EXPORT JSON
// ==========================================================================
function exportJSON() {
  playSuccessSound();
  const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'portfolio_data.json';
  a.click();
  logToTerminal('JSON diekspor.', 'SYSTEM');
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.personal) {
        portfolioData = parsed;
        saveToLocalStorage();
        document.getElementById('fullName').value = portfolioData.personal.fullName || '';
        document.getElementById('headline').value = portfolioData.personal.headline || '';
        document.getElementById('email').value = portfolioData.personal.email || '';
        document.getElementById('phone').value = portfolioData.personal.phone || '';
        document.getElementById('location').value = portfolioData.personal.location || '';
        document.getElementById('bio').value = portfolioData.bio || '';
        renderAllBuilderLists();
        updateLivePreview();
        logToTerminal('JSON berhasil dimuat.', 'SYSTEM');
        playSuccessSound();
      }
    } catch (err) {
      logToTerminal('Gagal membaca JSON.', 'ERROR');
    }
  };
  reader.readAsText(file);
}

// ==========================================================================
// EXPORT STANDALONE HTML
// ==========================================================================
function exportHTML() {
  playSuccessSound();
  logToTerminal('Mengkompilasi HTML...', 'COMPILER');

  const { personal, bio, skills, experience, projects, social } = portfolioData;
  const cs = getComputedStyle(document.querySelector('.portfolio-theme-wrapper'));
  const vars = {};
  ['--pf-bg','--pf-text','--pf-text-muted','--pf-primary','--pf-primary-rgb','--pf-accent','--pf-accent-rgb','--pf-card-bg','--pf-card-border','--pf-shadow','--pf-blob-1','--pf-blob-2','--pf-blob-3','--pf-badge-bg','--pf-nav-bg','--pf-lime'].forEach(v => {
    vars[v] = cs.getPropertyValue(v).trim();
  });

  // Build sections HTML
  let skillsHTML = '';
  if (skills.length > 0) {
    skillsHTML = skills.map(s => `<div class="skill-card">⚡ <strong>${s.name}</strong><small>${s.level}</small></div>`).join('');
  }

  let expHTML = '';
  experience.forEach(e => {
    if (e.position || e.company) {
      expHTML += `<div class="timeline-item"><div class="tl-dot"></div><div class="tl-card"><h3>${e.position||''}</h3><span class="tl-company">${e.company||''}</span><span class="tl-period">${e.duration||''}</span><p>${e.description||''}</p></div></div>`;
    }
  });

  let projHTML = '';
  projects.forEach(p => {
    if (p.title) {
      let tech = (p.tech||[]).map(t=>`<span class="tech">${t}</span>`).join('');
      projHTML += `<div class="proj-card"><h3>${p.title}</h3>${tech?`<div class="tech-list">${tech}</div>`:''}<p>${p.description||''}</p>${p.link?`<a href="${p.link}" target="_blank">Lihat →</a>`:''}</div>`;
    }
  });

  let socHTML = '';
  social.forEach(s => {
    if (s.platform && s.url) socHTML += `<a href="${s.url}" target="_blank" class="soc-link">${s.platform}</a>`;
  });

  const photoTag = personal.photo ? `<img src="${personal.photo}" alt="${personal.fullName}" class="avatar">` : '';

  const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${personal.fullName||'Portfolio'}</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Poppins:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
:root{--bg:${vars['--pf-bg']};--text:${vars['--pf-text']};--muted:${vars['--pf-text-muted']};--primary:${vars['--pf-primary']};--primary-rgb:${vars['--pf-primary-rgb']};--accent:${vars['--pf-accent']};--card-bg:${vars['--pf-card-bg']};--card-border:${vars['--pf-card-border']};--shadow:${vars['--pf-shadow']};--badge-bg:${vars['--pf-badge-bg']};--blob1:${vars['--pf-blob-1']};--blob2:${vars['--pf-blob-2']};--blob3:${vars['--pf-blob-3']};}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;}
.blobs{position:fixed;inset:0;pointer-events:none;z-index:0;}.blob{position:absolute;border-radius:50%;filter:blur(90px);opacity:0.8;}
.b1{width:350px;height:350px;background:var(--blob1);top:-80px;left:-80px;animation:f1 25s infinite ease-in-out alternate;}
.b2{width:400px;height:400px;background:var(--blob2);bottom:5%;right:-100px;animation:f2 28s infinite ease-in-out alternate;}
.b3{width:280px;height:280px;background:var(--blob3);top:45%;left:50%;animation:f3 20s infinite ease-in-out alternate;}
@keyframes f1{0%{transform:translate(0,0)}50%{transform:translate(60px,40px) scale(1.1)}100%{transform:translate(0,0)}}
@keyframes f2{0%{transform:translate(0,0)}50%{transform:translate(-50px,-70px) scale(0.9)}100%{transform:translate(0,0)}}
@keyframes f3{0%{transform:translate(0,0)}50%{transform:translate(-40px,50px)}100%{transform:translate(0,0)}}
.wrap{max-width:800px;margin:0 auto;padding:0 24px;position:relative;z-index:1;}
section{min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:80px 0;}
.hero{text-align:center;}.avatar{width:160px;height:160px;border-radius:50%;border:4px solid rgba(var(--primary-rgb),0.3);object-fit:cover;margin:0 auto 24px;display:block;box-shadow:0 10px 30px var(--shadow);}
h1{font-family:'Poppins',sans-serif;font-size:48px;font-weight:800;margin-bottom:8px;}
.headline{font-size:20px;color:var(--primary);font-style:italic;margin-bottom:16px;}
.bio-short{color:var(--muted);margin-bottom:24px;max-width:500px;margin-left:auto;margin-right:auto;}
.actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:24px;}
.btn-p{padding:12px 24px;background:var(--primary);color:#000;border-radius:25px;text-decoration:none;font-weight:600;font-size:13px;transition:all .3s;}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 20px var(--shadow);}
.btn-s{padding:12px 24px;background:var(--card-bg);color:var(--text);border:1px solid var(--card-border);border-radius:25px;text-decoration:none;font-weight:600;font-size:13px;}
.socials{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;}
.soc-link{padding:6px 14px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:20px;color:var(--text);text-decoration:none;font-size:11px;font-family:'JetBrains Mono',monospace;transition:all .3s;}
.soc-link:hover{background:var(--primary);color:#000;transform:translateY(-2px);}
.sec-title span{font-family:'JetBrains Mono',monospace;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:var(--primary);display:block;margin-bottom:8px;}
.sec-title h2{font-family:'Poppins',sans-serif;font-size:32px;font-weight:700;margin-bottom:32px;}
.glass{background:var(--card-bg);backdrop-filter:blur(12px);border:1px solid var(--card-border);border-radius:16px;padding:32px;margin-bottom:24px;box-shadow:0 12px 30px var(--shadow);}
.meta-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-top:20px;}
.meta-item{display:flex;align-items:center;gap:10px;}.meta-icon{font-size:18px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:var(--badge-bg);border-radius:8px;}
.meta-label{font-size:10px;text-transform:uppercase;color:var(--muted);font-family:'JetBrains Mono',monospace;}.meta-val{font-size:13px;font-weight:600;}
.skills-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:14px;}
.skill-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:16px;text-align:center;transition:all .3s;display:flex;flex-direction:column;align-items:center;gap:8px;}
.skill-card:hover{transform:translateY(-4px);border-color:var(--primary);}
.skill-card small{font-size:10px;color:var(--primary);font-family:'JetBrains Mono',monospace;}
.timeline{padding-left:28px;position:relative;}.timeline::before{content:'';position:absolute;top:0;left:9px;width:2px;height:100%;background:rgba(var(--primary-rgb),0.2);}
.timeline-item{position:relative;margin-bottom:32px;}.tl-dot{position:absolute;left:-28px;top:8px;width:18px;height:18px;border-radius:50%;border:4px solid var(--primary);background:var(--card-bg);z-index:2;}
.tl-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:20px;transition:all .3s;}
.tl-card:hover{transform:translateX(6px);}
.tl-card h3{font-family:'Poppins',sans-serif;font-size:16px;font-weight:700;margin-bottom:4px;}
.tl-company{font-size:12px;color:var(--primary);font-family:'JetBrains Mono',monospace;}
.tl-period{display:inline-block;padding:2px 8px;background:var(--badge-bg);border:1px solid var(--card-border);color:var(--primary);border-radius:10px;font-size:10px;margin:6px 0;}
.tl-card p{font-size:13px;color:var(--muted);line-height:1.6;white-space:pre-wrap;}
.proj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;}
.proj-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:16px;padding:20px;transition:all .3s;}
.proj-card:hover{transform:translateY(-5px);}
.proj-card h3{font-family:'Poppins',sans-serif;font-size:15px;font-weight:700;margin-bottom:8px;}
.proj-card p{font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:8px;}
.proj-card a{color:var(--primary);text-decoration:none;font-size:12px;font-weight:600;}
.tech-list{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;}.tech{font-size:10px;padding:2px 6px;background:rgba(var(--primary-rgb),0.08);color:var(--accent);border:1px solid rgba(var(--primary-rgb),0.15);border-radius:3px;font-family:'JetBrains Mono',monospace;}
.contact-grid{display:grid;grid-template-columns:1fr 1.5fr;gap:24px;}
.contact-grid h3{font-family:'Poppins',sans-serif;font-size:20px;margin-bottom:12px;}
.contact-grid>div:first-child>p{font-size:13px;color:var(--muted);margin-bottom:16px;}
.c-card{background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;padding:14px;margin-bottom:10px;display:flex;align-items:center;gap:12px;}
.c-card .c-icon{font-size:18px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:var(--badge-bg);border-radius:50%;}
.c-card h4{font-size:10px;text-transform:uppercase;color:var(--muted);}.c-card p{font-size:13px;font-weight:600;}
.c-form{display:flex;flex-direction:column;gap:12px;}
.c-form input,.c-form textarea{padding:12px;background:var(--card-bg);border:1px solid var(--card-border);border-radius:12px;font-family:'Inter',sans-serif;font-size:13px;color:var(--text);outline:none;}
.c-form input:focus,.c-form textarea:focus{border-color:var(--primary);}
footer{margin-top:60px;padding:20px 0;border-top:1px solid var(--card-border);text-align:center;font-size:11px;color:var(--muted);}
.reveal{opacity:0;transform:translateY(25px);transition:all .6s ease;}.reveal.show{opacity:1;transform:translateY(0);}
@media(max-width:768px){h1{font-size:32px;}.contact-grid{grid-template-columns:1fr;}.hero .avatar{width:120px;height:120px;}}
</style></head><body>
<div class="blobs"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div></div>
<div class="wrap">
<section class="hero reveal">
${photoTag}
<h1>${personal.fullName||'Portfolio'}</h1>
<p class="headline">${personal.headline||''}</p>
<p class="bio-short">${bio?bio.substring(0,160):''}</p>
<div class="actions">
<a href="#contact" class="btn-p">Hubungi Saya →</a>
<a href="#projects" class="btn-s">Lihat Projek</a>
</div>
<div class="socials">${socHTML}</div>
</section>

<section class="reveal"><div class="sec-title"><span>Tentang Saya</span><h2>Cerita Singkat</h2></div>
<div class="glass"><p style="color:var(--muted);line-height:1.8;white-space:pre-wrap;margin-bottom:20px;">${bio||''}</p>
<div class="meta-grid">
<div class="meta-item"><div class="meta-icon">📍</div><div><div class="meta-label">Lokasi</div><div class="meta-val">${personal.location||'-'}</div></div></div>
<div class="meta-item"><div class="meta-icon">✉️</div><div><div class="meta-label">Email</div><div class="meta-val">${personal.email||'-'}</div></div></div>
<div class="meta-item"><div class="meta-icon">📱</div><div><div class="meta-label">Telepon</div><div class="meta-val">${personal.phone||'-'}</div></div></div>
</div></div></section>

${skills.length?`<section class="reveal"><div class="sec-title"><span>Keahlian</span><h2>Yang Saya Kuasai</h2></div><div class="skills-grid">${skillsHTML}</div></section>`:''}

${expHTML?`<section class="reveal"><div class="sec-title"><span>Karir</span><h2>Riwayat Pengalaman</h2></div><div class="timeline">${expHTML}</div></section>`:''}

${projHTML?`<section id="projects" class="reveal"><div class="sec-title"><span>Projek</span><h2>Karya Terbaik</h2></div><div class="proj-grid">${projHTML}</div></section>`:''}

<section id="contact" class="reveal"><div class="sec-title"><span>Kontak</span><h2>Mari Berkolaborasi!</h2></div>
<div class="contact-grid">
<div><h3>Ada ide?</h3><p>Hubungi saya melalui kontak berikut.</p>
<div class="c-card"><div class="c-icon">✉️</div><div><h4>Email</h4><p>${personal.email||'-'}</p></div></div>
<div class="c-card"><div class="c-icon">📱</div><div><h4>Telepon</h4><p>${personal.phone||'-'}</p></div></div>
</div>
<div><form class="c-form" onsubmit="event.preventDefault();alert('Pesan terkirim! (simulasi)');this.reset();"><input placeholder="Nama Anda" required><input type="email" placeholder="Email Anda" required><textarea placeholder="Pesan Anda" rows="4" required></textarea><button type="submit" class="btn-p" style="border:none;cursor:pointer;">Kirim Pesan →</button></form></div>
</div>
<footer>© ${new Date().getFullYear()} ${personal.fullName||'Portfolio'}. Dibuat dengan ❤️ & kode.</footer>
</section>
</div>
<script>
const observer=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show');});},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
</script></body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${(personal.fullName || 'portfolio').toLowerCase().replace(/\s+/g, '_')}_website.html`;
  a.click();
  logToTerminal('HTML berhasil dikompilasi & diunduh!', 'COMPILER');
}
