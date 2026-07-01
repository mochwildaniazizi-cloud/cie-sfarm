/* ==========================================================================
   RETRO AUDIO SYNTH ENGINE (WEB AUDIO API)
   ========================================================================== */
class RetroSynth {
    constructor() {
        this.ctx = null;
        this.isPlayingMusic = false;
        this.musicInterval = null;
        this.tempo = 135; // BPM
        this.musicSequence = [
            // Note, duration in beats (Happy retro game theme)
            ['C5', 0.25], ['E5', 0.25], ['G5', 0.25], ['C6', 0.25],
            ['G5', 0.25], ['E5', 0.25], ['F5', 0.25], ['A5', 0.25],
            ['C6', 0.25], ['A5', 0.25], ['F5', 0.25], ['G5', 0.25],
            ['B5', 0.25], ['D6', 0.25], ['B5', 0.25], ['G5', 0.25],
            ['A5', 0.25], ['C6', 0.25], ['E6', 0.25], ['C6', 0.25],
            ['A5', 0.25], ['F5', 0.25], ['G5', 0.25], ['C5', 0.5],
            ['E5', 0.5], ['G5', 0.5]
        ];
        this.seqIndex = 0;
        this.notesFreq = {
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
            'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51
        };
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Short retro UI click
    playClick() {
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(150, now + 0.03);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    // Disk drive write/read sound
    playDiskChirp() {
        this.init();
        const now = this.ctx.currentTime;
        for (let i = 0; i < 4; i++) {
            const time = now + (i * 0.15);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(80 + Math.random() * 40, time);
            osc.frequency.setValueAtTime(400 + Math.random() * 200, time + 0.05);

            gain.gain.setValueAtTime(0.12, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + 0.12);
        }
    }

    // Grinding crunch sound
    playGrind() {
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const oscNoise = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.2);

        oscNoise.type = 'triangle';
        oscNoise.frequency.setValueAtTime(200, now);
        oscNoise.frequency.linearRampToValueAtTime(30, now + 0.15);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        oscNoise.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        oscNoise.start(now);
        osc.stop(now + 0.25);
        oscNoise.stop(now + 0.25);
    }

    // Achievement fanfare chime
    playFanfare() {
        this.init();
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const time = now + (idx * 0.09);

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.08, time + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + 0.4);
        });
    }

    toggleMusic(onPlayToggle) {
        this.init();
        if (this.isPlayingMusic) {
            this.stopMusic();
            onPlayToggle(false);
        } else {
            this.isPlayingMusic = true;
            onPlayToggle(true);
            this.startMusicSequence();
        }
    }

    startMusicSequence() {
        const secondsPerBeat = 60.0 / this.tempo;
        
        const playNext = () => {
            if (!this.isPlayingMusic) return;

            const noteInfo = this.musicSequence[this.seqIndex];
            const noteName = noteInfo[0];
            const duration = noteInfo[1] * secondsPerBeat;
            const freq = this.notesFreq[noteName];

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle'; // Sweet 8-bit chip sound
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration - 0.01);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);

            this.seqIndex = (this.seqIndex + 1) % this.musicSequence.length;
            this.musicInterval = setTimeout(playNext, duration * 1000);
        };

        playNext();
    }

    stopMusic() {
        this.isPlayingMusic = false;
        if (this.musicInterval) {
            clearTimeout(this.musicInterval);
            this.musicInterval = null;
        }
    }

    playBuzzer() {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }
}

const synth = new RetroSynth();

/* ==========================================================================
   SCRAPBOOK BACKGROUND STICKERS GENERATOR
   ========================================================================== */
function initScrapbookBg() {
    const bg = document.getElementById('floating-bg');
    const stickers = [
        { text: '★', class: 'star-sticker' },
        { text: '💖', class: 'heart-sticker' },
        { text: '💊', class: 'pill-sticker' },
        { text: 'Adristy! 🌸', class: 'grad-sticker' },
        { text: 'S.Farm! ✨', class: 'grad-sticker' },
        { text: 'OSCE ❌', class: 'pill-sticker' },
        { text: 'Revisi Dosen 📝', class: 'pill-sticker' },
        { text: '100% Lulus 🎓', class: 'grad-sticker' },
        { text: 'Apoteker ✨', class: 'grad-sticker' },
        { text: 'Anggun 🌸', class: 'grad-sticker' },
        { text: 'Bestie! 👦', class: 'heart-sticker' },
        { text: 'Cie S.Farm! 🎉', class: 'grad-sticker' },
        { text: 'Lulus! 🎓', class: 'grad-sticker' },
        { text: 'Anti Overthinking 🧠', class: 'pill-sticker' },
        { text: 'No More OSCE! ⏱️', class: 'pill-sticker' },
        { text: 'Pharmacist 🧪', class: 'grad-sticker' },
        { text: 'Mortar & Pestle 🥣', class: 'pill-sticker' },
        { text: '💊 1000mg Bahagia', class: 'pill-sticker' },
        { text: 'S.Tr.Kom 💻', class: 'grad-sticker' }
    ];

    // Distribute stickers across background statically (dense 8x6 grid)
    const colCount = 8;
    const rowCount = 6;
    
    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
            if (Math.random() > 0.35) {
                const spec = stickers[Math.floor(Math.random() * stickers.length)];
                createSticker(bg, spec, r, c, rowCount, colCount);
            }
        }
    }
}

function createSticker(container, spec, r, c, totalR, totalC) {
    const el = document.createElement('div');
    el.className = `sticker ${spec.class}`;
    el.textContent = spec.text;

    // Calculate grid alignment with random jitter
    const xBase = (c / totalC) * 100;
    const yBase = (r / totalR) * 100;
    const jitterX = (Math.random() - 0.5) * 12;
    const jitterY = (Math.random() - 0.5) * 12;
    const rotate = (Math.random() - 0.5) * 35;

    el.style.left = `${xBase + 5 + jitterX}%`;
    el.style.top = `${yBase + 5 + jitterY}%`;
    el.style.setProperty('--rot', `${rotate}deg`);
    el.style.animationDelay = `${Math.random() * -4}s`;

    container.appendChild(el);
}

/* ==========================================================================
   NAVIGATION & TRANSITION STATE
   ========================================================================== */
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
    }
}

/* ==========================================================================
   MAIN CODE SETUP
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Game progression tracking sets
    let clickedPolaroids = new Set();
    let clickedPotions = new Set();

    // 1. Load Background Stickers
    initScrapbookBg();

    // Auto-pause BGM when page is hidden (minimized, switch tabs, etc.) and auto-resume on return
    document.addEventListener('visibilitychange', () => {
        const soundBtn = document.getElementById('sound-btn');
        if (document.hidden) {
            if (synth.isPlayingMusic) {
                synth.stopMusic();
                synth.wasPlayingBeforeHidden = true;
                if (soundBtn) {
                    soundBtn.classList.remove('playing');
                    soundBtn.querySelector('.text').textContent = 'BGM Off';
                    soundBtn.querySelector('.icon').textContent = '🔇';
                }
            }
        } else {
            if (synth.wasPlayingBeforeHidden) {
                synth.wasPlayingBeforeHidden = false;
                synth.toggleMusic((playing) => {
                    if (playing && soundBtn) {
                        soundBtn.classList.add('playing');
                        soundBtn.querySelector('.text').textContent = 'BGM On';
                        soundBtn.querySelector('.icon').textContent = '🔊';
                    }
                });
            }
        }
    });

    // 2. Sound Controller Button Action
    const soundBtn = document.getElementById('sound-btn');
    soundBtn.addEventListener('click', () => {
        synth.toggleMusic((playing) => {
            if (playing) {
                soundBtn.classList.add('playing');
                soundBtn.querySelector('.text').textContent = 'BGM On';
                soundBtn.querySelector('.icon').textContent = '🔊';
            } else {
                soundBtn.classList.remove('playing');
                soundBtn.querySelector('.text').textContent = 'BGM Off';
                soundBtn.querySelector('.icon').textContent = '🔇';
            }
        });
    });

    // 3. Welcome / Name Verification Action
    const startBtn = document.getElementById('btn-start');
    const nameInput = document.getElementById('username-input');
    const loginError = document.getElementById('login-error');

    nameInput.focus();

    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startBtn.click();
        }
    });

    startBtn.addEventListener('click', () => {
        const enteredName = nameInput.value.trim().toLowerCase();
        
        if (enteredName === "") {
            loginError.textContent = "Ketik nama dulu biar sistem bisa memverifikasi! 💕";
            loginError.style.display = "block";
            return;
        }

        synth.init();
        synth.playClick();

        // Strictly verify name: must contain 'anggun', 'andun', 'adristy', 'adristi', 'nityasa', 'saraswati', or 's.farm'
        const isValidName = enteredName.includes('anggun') || 
                            enteredName.includes('andun') || 
                            enteredName.includes('adristy') || 
                            enteredName.includes('adristi') || 
                            enteredName.includes('nityasa') || 
                            enteredName.includes('saraswati') || 
                            enteredName.includes('s.farm') ||
                            enteredName.includes('farm');

        if (!isValidName) {
            loginError.textContent = "Nama tidak terdaftar sebagai Apoteker S.Farm kita! Coba masukkan 'Anggun', 'Andun', atau nama lengkapnya 💖";
            loginError.style.display = "block";
            return;
        }

        // Hide error message if validation succeeds
        loginError.style.display = "none";

        const profileCaptions = document.querySelectorAll('.handwritten-title');
        const pharmacistName = document.querySelector('.pharmacist-name');
        
        // Capitalized correct name spelling
        const fullName = "Adristy Nityasa Anggun Saraswati, S.Farm.";
        profileCaptions.forEach(el => el.textContent = fullName);
        if (pharmacistName) pharmacistName.textContent = fullName;

        // Show Diskette Loading Screen
        showScreen('screen-loading');
        
        // Loop disk reading chirp sounds
        let chirpCount = 0;
        const chirpInterval = setInterval(() => {
            synth.playDiskChirp();
            chirpCount++;
            if (chirpCount >= 3) clearInterval(chirpInterval);
        }, 800);

        // Simulated Disk Read Progress Bar
        const loadingBar = document.getElementById('loading-bar-fill');
        let progress = 0;
        const progInterval = setInterval(() => {
            progress += 5;
            loadingBar.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(progInterval);
                
                // Transition to Polaroid pop-up overlay first!
                setTimeout(() => {
                    const profilePop = document.getElementById('profile-pop-overlay');
                    if (profilePop) {
                        profilePop.style.display = 'flex';
                        initConfetti('profile-confetti-canvas');
                        synth.playFanfare();
                    } else {
                        showScreen('screen-hub');
                        if (!synth.isPlayingMusic) {
                            soundBtn.click();
                        }
                    }
                }, 400);
            }
        }, 120);
    });

    // 4. Tab Navigation System (linear progression locked checks)
    const tabs = document.querySelectorAll('.nav-tape');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Block click if tab is locked
            if (tab.classList.contains('locked')) {
                synth.playBuzzer();
                return;
            }

            synth.playClick();
            const targetId = tab.getAttribute('data-target');

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            panes.forEach(p => p.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 5. Polaroid Obstacles Dissolve Click
    const polaroids = document.querySelectorAll('.obstacle-polaroid');
    const affCard = document.getElementById('affirmation-display');
    const affTitle = document.getElementById('affirmation-title');
    const affText = document.getElementById('affirmation-text');

    polaroids.forEach(pol => {
        pol.addEventListener('click', () => {
            if (pol.classList.contains('scratched')) return;

            synth.playClick();
            pol.classList.add('scratched');

            // Track clicked polaroids
            const obs = pol.getAttribute('data-obstacle');
            clickedPolaroids.add(obs);

            // Check if all 5 are scratched to unlock Tab 2
            if (clickedPolaroids.size === 5) {
                const navPotions = document.getElementById('nav-potions');
                if (navPotions && navPotions.classList.contains('locked')) {
                    navPotions.classList.remove('locked');
                    navPotions.removeAttribute('disabled');
                    navPotions.querySelector('span').textContent = 'Ramuan Afirmasi 🧪';
                    
                    setTimeout(() => {
                        synth.playFanfare();
                        alert("Selamat! Semua rintangan kuliah farmasi telah diluluhkan. 'Ramuan Afirmasi' kini terbuka! 🧪");
                    }, 1200);
                }
            }

            // Flat rectangular confetti spark effect
            const rect = pol.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            createFlatSparks(x, y);

            // Display memo
            const data = obstacleMemos[obs];
            if (data) {
                affTitle.textContent = data.title;
                affText.textContent = data.text;
                affCard.classList.remove('hidden');

                // Bounce animation
                affCard.style.transform = 'scale(1.03) rotate(0.5deg)';
                setTimeout(() => {
                    affCard.style.transform = 'scale(1) rotate(0deg)';
                }, 180);
            }
        });
    });

    const obstacleMemos = {
        laporan: {
            title: "Laporan Praktikum: LULUS DILULUSKAN! 📝",
            text: "Laporan tebal ratusan halaman ditulis tangan, gambar jaringan sel tanaman di mikroskop, hitung rumus pengenceran kimia ruwet... Terima kasih Adristy sudah mau bertahan nulis semua itu meskipun jari kram dan capek luar biasa! Hasil tulisan tanganmu itu sangat legendaris!"
        },
        osce: {
            title: "Ujian OSCE: MOMOK YANG BERHASIL DITAKLUKKAN! ⏱️",
            text: "Bel berbunyi kencang menandakan waktu stasiun berjalan, tangan gemetar pegang pipet dan racik puyer, ditatap dingin oleh dosen penguji... Tapi kamu tenang, fokus, dan membuktikan keahlian kefarmasianmu. OSCE terlewati dengan luar biasa!"
        },
        revisi: {
            title: "Revisi Skripsi: TUNDUK SEPENUHNYA! 💻",
            text: "Dosen coret lembar draf skripsi, ganti judul di tengah jalan, analisis data ditolak berulang kali... Semua revisi menyebalkan yang bikin sakit kepala itu akhirnya luluh di bawah ketabahan dan kecerdasanmu! Gelar S.Farm ini adalah saksi bisu kehebatanmu!"
        },
        kurangtidur: {
            title: "Tidur Kurang dari 4 Jam: SEKARANG BAYAR LUNAS! 😴",
            text: "Mata panda, kopi bergelas-gelas, belajar farmakologi sampai fajar menyingsing demi kuis praktikum... Sekarang bayar tuntas seluruh waktu tidurmu dengan tidur nyenyak yang paling bahagia sebagai seorang Sarjana Farmasi. Selamat istirahat panjang!"
        },
        badai: {
            title: "Badai Rintangan: KAMU ADALAH PEMENANGNYA! ⛈️",
            text: "Tetesan air mata lelah, rasa cemas apakah bisa selesai, dan rintangan kuliah lainnya... Semua badai itu tidak mampu merobohkan tekad bajamu. Kamu jauh lebih kuat dari badai apa pun, Anggun! Kami semua sangat bangga padamu."
        }
    };

    function createFlatSparks(x, y) {
        const colors = ['#ffb5c5', '#a0c4ff', '#ffebb3', '#c7f9cc', '#72efdd'];
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.style.position = 'absolute';
            p.style.width = `${5 + Math.random() * 10}px`;
            p.style.height = `${5 + Math.random() * 10}px`;
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.border = '1px solid #1d1d1d';
            p.style.left = `${x + window.scrollX}px`;
            p.style.top = `${y + window.scrollY}px`;
            p.style.pointerEvents = 'none';
            p.style.zIndex = '100';

            const angle = Math.random() * Math.PI * 2;
            const dist = 40 + Math.random() * 80;
            const destX = Math.cos(angle) * dist;
            const destY = Math.sin(angle) * dist;

            p.style.transition = 'transform 0.8s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.8s ease';
            document.body.appendChild(p);

            // Trigger transition immediately
            setTimeout(() => {
                p.style.transform = `translate(${destX}px, ${destY}px) rotate(${Math.random() * 180}deg)`;
                p.style.opacity = '0';
            }, 10);

            setTimeout(() => {
                p.remove();
            }, 850);
        }
    }

    // ================= TAB 2: STICKY NOTES MODAL LOGIC =================
    const stickyNotes = document.querySelectorAll('.sticky-note');
    const modal = document.getElementById('potion-modal');
    const modalClose = document.getElementById('modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    const noteLetters = {
        sukses: {
            title: "Ramuan Sukses Abadi ✨",
            text: "Dear Adristy Anggun,\n\nGerbang dunia kerja atau profesi Apoteker (Apt.) yang mulia sudah menantimu di depan mata.\n\nRamuan ini adalah doa tulus agar setiap keputusan klinismu tepat, karirmu melesat tinggi, dan rezekimu mengalir berkah melimpah. Dunia kesehatan sangat beruntung memilikimu!"
        },
        bahagia: {
            title: "Elixir Kebahagiaan 💖",
            text: "Anggun sayang,\n\nSetelah seluruh peluh perjuangan kuliah Farmasi yang luar biasa melelahkan, kamu berhak mendapatkan kebahagiaan sepuasnya.\n\nSemoga hari-harimu selalu diiringi tawa renyah, dikelilingi sahabat tulus, dan dipenuhi kejutan-kejutan indah semesta setiap harinya!"
        },
        percaya: {
            title: "Tablet Ceria & Percaya Diri ⭐",
            text: "Hai Adristy,\n\nJika suatu hari kamu lelah atau ragu pada kemampuanmu, baca kembali catatan ini.\n\nIngatlah bahwa kamu adalah Adristy Nityasa Anggun Saraswati yang cerdas, yang berhasil menaklukkan monster tersulit bernama kuliah farmasi. Kamu pasti bisa melompati rintangan apa pun setelah ini!"
        },
        cinta: {
            title: "Sirup Cinta & Dukungan 🧸",
            text: "Ingat ya,\n\nKamu tidak pernah berjuang sendirian. Di sekitarmu ada sahabat, keluarga, dan kami semua yang selalu mendoakan dan super bangga atas pencapaian berhargamu.\n\nGelar S.Farm ini adalah bukti ketangguhanmu. We love you so, so much! Selamat merayakan kelulusanmu!"
        }
    };

    stickyNotes.forEach(note => {
        note.addEventListener('click', () => {
            synth.playFanfare();
            const pot = note.getAttribute('data-potion');
            const data = noteLetters[pot];

            if (data) {
                modalTitle.textContent = data.title;
                modalContent.textContent = data.text;
                modal.classList.remove('hidden');
                
                // Track clicked sticky notes
                clickedPotions.add(pot);

                // Check if all 4 are read to unlock Tab 3
                if (clickedPotions.size === 4) {
                    const navGrinder = document.getElementById('nav-grinder');
                    if (navGrinder && navGrinder.classList.contains('locked')) {
                        navGrinder.classList.remove('locked');
                        navGrinder.removeAttribute('disabled');
                        navGrinder.querySelector('span').textContent = 'Hancurkan Stress 🥣';
                        
                        setTimeout(() => {
                            synth.playFanfare();
                            alert("Semua ramuan doa telah dibaca. 'Stress Grinder' kini terbuka! 🥣");
                        }, 1200);
                    }
                }

                // Scroll main window to top so modal is fully in view
                window.scrollTo({ top: 0, behavior: 'smooth' });
                modal.scrollTop = 0;
                const notepadBody = document.querySelector('.notepad-body');
                if (notepadBody) notepadBody.scrollTop = 0;
            }
        });
    });

    modalClose.addEventListener('click', () => {
        synth.playClick();
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            synth.playClick();
            modal.classList.add('hidden');
        }
    });

    // ================= TAB 3: MORTAR STRESS GRINDER LOGIC =================
    const stressDisks = document.querySelectorAll('.stress-disk');
    const grindBtn = document.getElementById('btn-grind');
    const grinderStatus = document.getElementById('grinder-status');
    const pestleStick = document.getElementById('pestle-stick');
    const progressFill = document.getElementById('grind-progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    const mortarDust = document.getElementById('mortar-dust');
    const diplomaOverlay = document.getElementById('diploma-overlay');
    const closeDiplomaBtn = document.getElementById('btn-close-diploma');

    let grindProgress = 0;
    let groundIngredients = 0;
    const totalDisks = stressDisks.length;
    let queueStress = [];

    stressDisks.forEach(disk => {
        disk.addEventListener('click', () => {
            if (disk.classList.contains('added')) return;

            synth.playDiskChirp();
            disk.classList.add('added');
            
            const stressName = disk.getAttribute('data-stress');
            const flavor = disk.getAttribute('data-flavor');
            queueStress.push(stressName);
            groundIngredients++;

            // Expand dust size in bowl
            const dustHeight = groundIngredients * 15;
            mortarDust.style.height = `${dustHeight}%`;
            
            // Alter dust color palette
            const hues = [200, 320, 50, 140, 280];
            const activeHue = hues[groundIngredients % hues.length];
            mortarDust.style.backgroundColor = `hsl(${activeHue}, 80%, 75%)`;

            grinderStatus.innerHTML = `💾 STRESS ADDED: <strong>${stressName}</strong>.<br><span style="font-size:0.75rem; color: #ff3366;">${flavor}</span>`;

            grindBtn.classList.remove('disabled');
            grindBtn.removeAttribute('disabled');
        });
    });

    grindBtn.addEventListener('click', () => {
        if (queueStress.length === 0) return;

        synth.playGrind();
        pestleStick.classList.add('grinding');
        grindBtn.classList.add('disabled');
        grindBtn.setAttribute('disabled', 'true');

        setTimeout(() => {
            pestleStick.classList.remove('grinding');

            // Add progress
            const bump = Math.ceil(100 / totalDisks);
            grindProgress = Math.min(100, grindProgress + (bump * queueStress.length));
            
            progressFill.style.width = `${grindProgress}%`;
            progressPercent.textContent = `${grindProgress}%`;

            const crushedText = queueStress.join(' & ');
            grinderStatus.innerHTML = `SUCCESS: Menghancurkan <strong>${crushedText}</strong> menjadi bubuk berkilau!`;
            queueStress = [];

            const remaining = document.querySelectorAll('.stress-disk:not(.added)');
            if (remaining.length > 0 && grindProgress < 100) {
                setTimeout(() => {
                    grinderStatus.textContent = "Ketik/masukkan file stress lainnya untuk dihancurkan!";
                }, 1300);
            }

            if (grindProgress >= 100) {
                grinderStatus.innerHTML = "SYSTEM OK: 100% STRESS BERHASIL DIHANCURKAN!";
                setTimeout(() => {
                    triggerGraduationClimax();
                }, 800);
            }
        }, 500);
    });

    let confettiActive = false;
    function triggerGraduationClimax() {
        synth.playFanfare();
        diplomaOverlay.classList.remove('hidden');
        diplomaOverlay.style.display = 'flex';
        initConfetti('confetti-canvas');
    }

    // Flat Confetti animation
    let canvas, canvasCtx, particles = [];
    function initConfetti(canvasId) {
        canvas = document.getElementById(canvasId || 'confetti-canvas');
        if (!canvas) return;
        canvasCtx = canvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        particles = [];
        confettiActive = true;
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: 6 + Math.random() * 8,
                h: 4 + Math.random() * 6,
                d: Math.random() * canvas.height,
                color: ['#ffb5c5', '#a0c4ff', '#ffebb3', '#c7f9cc', '#72efdd'][Math.floor(Math.random() * 5)],
                rotation: Math.random() * 360,
                speedY: 2 + Math.random() * 3,
                speedX: (Math.random() - 0.5) * 2
            });
        }
        requestAnimationFrame(drawConfetti);
    }

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    function drawConfetti() {
        if (!confettiActive) return;

        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, idx) => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rotation += 2;

            canvasCtx.save();
            canvasCtx.translate(p.x, p.y);
            canvasCtx.rotate((p.rotation * Math.PI) / 180);
            canvasCtx.fillStyle = p.color;
            canvasCtx.strokeStyle = '#1d1d1d';
            canvasCtx.lineWidth = 1.5;
            canvasCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            canvasCtx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
            canvasCtx.restore();

            if (p.y > canvas.height) {
                particles[idx].y = -20;
                particles[idx].x = Math.random() * canvas.width;
            }
        });

        requestAnimationFrame(drawConfetti);
    }

    closeDiplomaBtn.addEventListener('click', () => {
        synth.playClick();
        confettiActive = false;
        diplomaOverlay.classList.add('hidden');
        diplomaOverlay.style.display = 'none';

        // Unlock Tab 4 (Prescription)
        const navPresc = document.getElementById('nav-prescription');
        if (navPresc && navPresc.classList.contains('locked')) {
            navPresc.classList.remove('locked');
            navPresc.removeAttribute('disabled');
            navPresc.querySelector('span').textContent = 'Resep Kebahagiaan 📜';
            
            setTimeout(() => {
                synth.playFanfare();
                alert("Resep Kebahagiaan spesial dari Wildani kini siap untuk kamu ambil! 📜");
                
                // Go to Prescription Tab
                const rxTab = document.getElementById('nav-prescription');
                if (rxTab) rxTab.click();
            }, 500);
        } else {
            // Already unlocked
            const rxTab = document.getElementById('nav-prescription');
            if (rxTab) rxTab.click();
        }
    });

    // ================= TAB 4: PRINT & RESTART LOGIC =================
    const printBtn = document.getElementById('btn-print-rx');
    const restartBtn = document.getElementById('btn-restart');

    printBtn.addEventListener('click', () => {
        synth.playFanfare();
        const element = document.getElementById('prescription-print');
        
        // Create off-screen container with fixed desktop width
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.top = '-9999px';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '480px';
        document.body.appendChild(tempContainer);
        
        // Clone the receipt
        const clone = element.cloneNode(true);
        clone.style.width = '480px';
        clone.style.maxWidth = 'none';
        clone.style.padding = '35px';
        
        tempContainer.appendChild(clone);
        
        // Render the fixed-width clone to canvas
        html2canvas(clone, {
            backgroundColor: '#faf7f0',
            scale: 2,
            logging: false,
            useCORS: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'Resep_Kebahagiaan_Adristy.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Clean up
            document.body.removeChild(tempContainer);
        }).catch(err => {
            console.error('Failed to save PNG, falling back to print:', err);
            document.body.removeChild(tempContainer);
            window.print();
        });
    });

    restartBtn.addEventListener('click', () => {
        synth.playClick();

        // Reset game progression locks
        clickedPolaroids.clear();
        clickedPotions.clear();

        const navPotions = document.getElementById('nav-potions');
        if (navPotions) {
            navPotions.classList.add('locked');
            navPotions.setAttribute('disabled', 'true');
            navPotions.querySelector('span').textContent = 'Ramuan Afirmasi 🔒';
        }
        const navGrinder = document.getElementById('nav-grinder');
        if (navGrinder) {
            navGrinder.classList.add('locked');
            navGrinder.setAttribute('disabled', 'true');
            navGrinder.querySelector('span').textContent = 'Hancurkan Stress 🔒';
        }
        const navPresc = document.getElementById('nav-prescription');
        if (navPresc) {
            navPresc.classList.add('locked');
            navPresc.setAttribute('disabled', 'true');
            navPresc.querySelector('span').textContent = 'Resep Kebahagiaan 🔒';
        }

        // Reset tab focus to first tab
        tabs.forEach(t => t.classList.remove('active'));
        const navCaps = document.getElementById('nav-capsules');
        if (navCaps) navCaps.classList.add('active');

        panes.forEach(p => p.classList.remove('active'));
        const tabCaps = document.getElementById('tab-capsules');
        if (tabCaps) tabCaps.classList.add('active');

        // Reset Onboarding state
        nameInput.value = "";
        loginError.style.display = "none";

        // Reset polaroids
        polaroids.forEach(pol => {
            pol.classList.remove('scratched');
        });
        affCard.classList.add('hidden');

        // Reset Grinder Game
        grindProgress = 0;
        groundIngredients = 0;
        queueStress = [];
        progressFill.style.width = '0%';
        progressPercent.textContent = '0%';
        mortarDust.style.height = '0px';
        grinderStatus.textContent = "SIAP MENERIMA INPUT RACUN...";
        grindBtn.classList.add('disabled');
        grindBtn.setAttribute('disabled', 'true');
        stressDisks.forEach(disk => {
            disk.classList.remove('added');
        });

        // Show Welcome Monitor
        showScreen('screen-welcome');
        nameInput.focus();
    });

    // Polaroid Welcome Modal Close Action
    const closeProfilePopBtn = document.getElementById('btn-close-profile-pop');
    const profilePopOverlay = document.getElementById('profile-pop-overlay');
    if (closeProfilePopBtn && profilePopOverlay) {
        closeProfilePopBtn.addEventListener('click', () => {
            synth.playClick();
            confettiActive = false; // Stop pop-up confetti
            profilePopOverlay.style.display = 'none';
            showScreen('screen-hub'); // Now reveal the dashboard!
            
            // Auto-start music if they haven't toggled it yet
            if (!synth.isPlayingMusic) {
                const soundBtn = document.getElementById('sound-btn');
                if (soundBtn) soundBtn.click();
            }
        });
    }
});
