"use strict";

/* ============================================================
   NEON MATH SPACE SHOOTER
   Vetri Vel Productions
   Complete application - Fixed ship and answer targets
   ============================================================ */

(() => {
  /* ----------------------------------------------------------
     1. CONFIGURATION
     ---------------------------------------------------------- */

  const SUPABASE_URL = "https://eivffausbsxtdvgeluxa.supabase.co";
  const SUPABASE_KEY = "sb_publishable_J69oI75KfMu4P4OMcuYBQg_d5v4OJLd";

  const SCORE_FUNCTION_NAME = "submit-score";

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 570;
  const TARGET_SIZE = 64;
  const PLAYER_SIZE = 58;

  const $ = (id) => document.getElementById(id);

  const elements = {
    pages: document.querySelectorAll(".page"),
    navLinks: document.querySelectorAll("[data-page]"),
    goButtons: document.querySelectorAll("[data-go]"),

    menuToggle: $("menuToggle"),
    nav: $("nav"),

    score: $("score"),
    lives: $("lives"),
    level: $("level"),
    streak: $("streak"),

    arena: $("arena"),
    question: $("question"),
    answerTargets: [
      $("answer0"),
      $("answer1"),
      $("answer2")
    ],
    playerShip: $("playerShip"),
    laserLayer: $("laserLayer"),
    toast: $("toast"),

    startOverlay: $("startOverlay"),
    pauseOverlay: $("pauseOverlay"),
    overOverlay: $("overOverlay"),
    transitionOverlay: $("transitionOverlay"),
    transitionText: $("transitionText"),

    startBtn: $("startBtn"),
    pauseBtn: $("pauseBtn"),
    resumeBtn: $("resumeOverlayBtn"),
    againBtn: $("againBtn"),

    leftBtn: $("leftBtn"),
    rightBtn: $("rightBtn"),
    fireBtn: $("fireBtn"),

    finalStats: $("finalStats"),
    connection: $("connection"),

    scoresList: $("scoresList"),

    prevShip: $("prevShip"),
    nextShip: $("nextShip"),
    selectedShip: $("selectedShip"),
    shipName: $("shipName"),
    shipDescription: $("shipDescription"),
    shipGrid: $("shipGrid"),

    nickname: $("nickname"),
    saveNick: $("saveNick"),
    profileBest: $("profileBest"),
    profileCorrect: $("profileCorrect"),
    profileStreak: $("profileStreak"),

    authStatus: $("authStatus"),
    authEmail: $("authEmail"),
    authPassword: $("authPassword"),
    signUpBtn: $("signUpBtn"),
    signInBtn: $("signInBtn"),
    signOutBtn: $("signOutBtn"),
    authMessage: $("authMessage"),

    achievementGrid: $("achievementGrid"),

    musicVolume: $("musicVolume"),
    sfxVolume: $("sfxVolume"),
    reducedMotion: $("reducedMotion"),
    mute: $("mute"),
    clearLocal: $("clearLocal"),

    bgm: $("bgm")
  };

  /* ----------------------------------------------------------
     2. HTML VALIDATION
     ---------------------------------------------------------- */

  const requiredElements = [
    "arena",
    "question",
    "playerShip",
    "laserLayer",
    "startBtn",
    "pauseBtn",
    "resumeBtn",
    "againBtn",
    "score",
    "lives",
    "level",
    "streak"
  ];

  const missingElements = requiredElements.filter(
    (id) => !elements[id]
  );

  if (missingElements.length > 0) {
    console.error(
      "Neon Math: Missing HTML elements:",
      missingElements
    );
    return;
  }

   /* ----------------------------------------------------------
     3. VISUAL FIXES — SVG SPACECRAFT
     ---------------------------------------------------------- */

  function installGameVisualFixes() {
    const style = document.createElement("style");
    style.id = "neon-game-visual-fixes";

    style.textContent = `
      #answer0,
      #answer1,
      #answer2,
      .answer-target {
        border: 2px solid #35f5ff !important;
        background: rgba(13, 31, 58, 0.96) !important;
        color: #ffffff !important;
        box-shadow:
          0 0 14px rgba(53, 245, 255, 0.55),
          inset 0 0 13px rgba(53, 245, 255, 0.18) !important;
        border-radius: 15px !important;
      }

      #playerShip {
        width: 58px !important;
        height: 58px !important;
        display: block !important;
        position: absolute !important;
        background: transparent !important;
        color: transparent !important;
        font-size: 0 !important;
        overflow: visible !important;
        filter: drop-shadow(0 0 9px #35f5ff);
      }

      #playerShip::before,
      #playerShip::after {
        content: none !important;
        display: none !important;
      }

      .ship-svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }

      .ship-option {
        display: grid;
        place-items: center;
        overflow: visible;
      }

      .ship-option .ship-svg {
        width: 80%;
        height: 80%;
      }

      .ship-option.selected {
        border-color: #35f5ff !important;
        box-shadow: 0 0 18px rgba(53,245,255,.6);
      }

      #selectedShip .ship-svg,
      .selected-ship-visual .ship-svg {
        width: 100%;
        height: 100%;
      }

      .profile-astronaut-visual {
        width: 150px;
        height: 150px;
        margin: 18px auto;
        display: grid;
        place-items: center;
        border: 1px solid rgba(53,245,255,.5);
        border-radius: 50%;
        background:
          radial-gradient(circle, rgba(53,245,255,.18), transparent 70%),
          rgba(12,18,43,.8);
        box-shadow: 0 0 28px rgba(53,245,255,.2);
      }

      .profile-astronaut-visual svg {
        width: 88%;
        height: 88%;
      }

      .locked-ship-svg {
        width: 30px;
        height: 30px;
        opacity: .65;
      }

      @media (prefers-reduced-motion: reduce) {
        .ship-svg {
          animation: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  installGameVisualFixes();

  /* ----------------------------------------------------------
     4. LOCAL STORAGE
     ---------------------------------------------------------- */

  const STORAGE_KEY = "neonMathSpaceShooter_v3";

  const defaultData = {
    nickname: "Player",
    bestScore: 0,
    totalCorrect: 0,
    bestStreak: 0,
    selectedShip: 0,
    unlockedShips: [0],
    achievements: [],
    settings: {
      musicVolume: 40,
      sfxVolume: 70,
      reducedMotion: false,
      mute: false
    }
  };

  function cloneDefaultData() {
    return JSON.parse(JSON.stringify(defaultData));
  }

  function loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return cloneDefaultData();

      const parsed = JSON.parse(saved);

      if (!parsed || typeof parsed !== "object") {
        return cloneDefaultData();
      }

      const result = {
        ...defaultData,
        ...parsed,
        settings: {
          ...defaultData.settings,
          ...(parsed.settings || {})
        }
      };

      if (!Array.isArray(result.achievements)) {
        result.achievements = [];
      }

      if (!Array.isArray(result.unlockedShips)) {
        result.unlockedShips = [0];
      }

      result.unlockedShips = result.unlockedShips.filter(
        (index) =>
          Number.isInteger(index) &&
          index >= 0 &&
          index < 5
      );

      if (!result.unlockedShips.includes(0)) {
        result.unlockedShips.unshift(0);
      }

      if (
        !Number.isInteger(result.selectedShip) ||
        !result.unlockedShips.includes(result.selectedShip)
      ) {
        result.selectedShip = 0;
      }

      result.nickname =
        typeof result.nickname === "string"
          ? result.nickname.slice(0, 16)
          : "Player";

      result.bestScore = Math.max(
        0,
        Number(result.bestScore) || 0
      );

      result.totalCorrect = Math.max(
        0,
        Number(result.totalCorrect) || 0
      );

      result.bestStreak = Math.max(
        0,
        Number(result.bestStreak) || 0
      );

      result.settings.musicVolume = clamp(
        Number(result.settings.musicVolume) || 0,
        0,
        100
      );

      result.settings.sfxVolume = clamp(
        Number(result.settings.sfxVolume) || 0,
        0,
        100
      );

      return result;
    } catch (error) {
      console.error("Could not load local data:", error);
      return cloneDefaultData();
    }
  }

  let data = loadData();

  function saveData() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error("Could not save local data:", error);
    }
  }

  /* ----------------------------------------------------------
     5. GAME STATE
     ---------------------------------------------------------- */

  const game = {
    running: false,
    paused: false,
    gameOver: false,

    score: 0,
    lives: 3,
    level: 1,

    streak: 0,
    correctCount: 0,

    playerX: GAME_WIDTH / 2,
    playerY: GAME_HEIGHT - 50,

    playerSpeed: 420,

    targets: [],
    bullets: [],

    currentQuestion: null,

    lastTime: 0,
    animationFrame: null,

    movingLeft: false,
    movingRight: false,
    fireHeld: false,

    lastShot: 0,

    transitionTimer: 0,
    toastTimer: 0
  };

  /* ----------------------------------------------------------
     6. HELPERS
     ---------------------------------------------------------- */

  function randomInt(min, max) {
    return Math.floor(
      Math.random() * (max - min + 1)
    ) + min;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function shuffle(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
      const j = randomInt(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
  }

  function safeText(element, value) {
    if (element) {
      element.textContent = String(value);
    }
  }

  function setMessage(message, isError = false) {
    if (!elements.authMessage) return;

    elements.authMessage.textContent = message;
    elements.authMessage.style.color = isError
      ? "#ff526f"
      : "#35f5ff";
  }

  function getArenaScale() {
    const rect = elements.arena.getBoundingClientRect();

    return {
      x: rect.width / GAME_WIDTH,
      y: rect.height / GAME_HEIGHT,
      width: rect.width,
      height: rect.height
    };
  }

  /* ----------------------------------------------------------
     7. NAVIGATION
     ---------------------------------------------------------- */

  function showPage(pageName) {
    const page = $(pageName);

    if (!page || !page.classList.contains("page")) {
      console.warn("Unknown page:", pageName);
      return;
    }

    elements.pages.forEach((item) => {
      item.classList.toggle(
        "active",
        item.id === pageName
      );
    });

    elements.navLinks.forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.page === pageName
      );
    });

    if (elements.nav) {
      elements.nav.classList.remove("open");
    }

    if (elements.menuToggle) {
      elements.menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    if (pageName === "leaderboard") loadLeaderboard();
    if (pageName === "profile") updateProfile();
    if (pageName === "achievements") renderAchievements();
    if (pageName === "hangar") renderHangar();
  }

  elements.navLinks.forEach((button) => {
    button.addEventListener("click", () => {
      showPage(button.dataset.page);
    });
  });

  elements.goButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showPage(button.dataset.go);
    });
  });

  if (elements.menuToggle && elements.nav) {
    elements.menuToggle.addEventListener("click", () => {
      const isOpen = elements.nav.classList.toggle("open");

      elements.menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });
  }

  /* ----------------------------------------------------------
     8. AUDIO
     ---------------------------------------------------------- */

  let audioContext = null;

  function getAudioContext() {
    if (data.settings.mute) return null;

    try {
      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContextClass) return null;

      if (!audioContext) {
        audioContext = new AudioContextClass();
      }

      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }

      return audioContext;
    } catch (error) {
      console.warn("Audio unavailable:", error);
      return null;
    }
  }

  function playSound(frequency = 500, duration = 0.08) {
    if (data.settings.mute) return;
    if (data.settings.sfxVolume <= 0) return;

    const context = getAudioContext();
    if (!context) return;

    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      gain.gain.value =
        (data.settings.sfxVolume / 100) * 0.08;

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + duration
      );

      oscillator.stop(context.currentTime + duration);
    } catch (error) {
      console.warn("Sound effect failed:", error);
    }
  }

  function updateAudioSettings() {
    if (!elements.bgm) return;

    elements.bgm.volume =
      clamp(data.settings.musicVolume, 0, 100) / 100;

    elements.bgm.muted = Boolean(data.settings.mute);

    if (data.settings.mute) {
      elements.bgm.pause();
    } else if (game.running) {
      elements.bgm.play().catch(() => {});
    }
  }

  async function startMusic() {
    if (!elements.bgm || data.settings.mute) return;

    updateAudioSettings();

    try {
      await elements.bgm.play();
    } catch (error) {
      console.info(
        "Music playback requires user interaction:",
        error.message
      );
    }
  }

    /* ----------------------------------------------------------
     9. SHIPS — ORIGINAL SVG SPACECRAFT
     ---------------------------------------------------------- */

  const ships = [
    {
      name: "NEON EXPLORER",
      theme: "cyan",
      description: "Your first spacecraft."
    },
    {
      name: "CYBER FALCON",
      theme: "blue",
      description: "A high-speed futuristic spacecraft."
    },
    {
      name: "GALAXY GUARDIAN",
      theme: "purple",
      description: "A powerful guardian of deep space."
    },
    {
      name: "STAR PHOENIX",
      theme: "orange",
      description: "A blazing spacecraft built for adventure."
    },
    {
      name: "QUANTUM RIDER",
      theme: "green",
      description: "An advanced experimental spacecraft."
    }
  ];

  function shipSvg(theme = "cyan") {
    const colors = {
      cyan: ["#ffffff", "#35f5ff", "#1689d8"],
      blue: ["#e7f3ff", "#438bff", "#2736c9"],
      purple: ["#ffffff", "#bd72ff", "#713bdb"],
      orange: ["#fff4df", "#ff9b45", "#e64c35"],
      green: ["#efffe9", "#68ffb1", "#13a77c"]
    };

    const [light, main, dark] = colors[theme] || colors.cyan;

    return `
      <svg
        class="ship-svg"
        viewBox="0 0 100 120"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Spacecraft"
        role="img"
      >
        <defs>
          <linearGradient id="body-${theme}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${light}"/>
            <stop offset="48%" stop-color="${main}"/>
            <stop offset="100%" stop-color="${dark}"/>
          </linearGradient>

          <linearGradient id="glass-${theme}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="45%" stop-color="${main}"/>
            <stop offset="100%" stop-color="#172b72"/>
          </linearGradient>

          <linearGradient id="flame-${theme}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="45%" stop-color="${main}"/>
            <stop offset="100%" stop-color="${dark}" stop-opacity="0"/>
          </linearGradient>
        </defs>

        <!-- Engine flames -->
        <path
          d="M36 83 L43 117 L50 96 L57 117 L64 83"
          fill="url(#flame-${theme})"
          opacity=".95"
        />

        <!-- Left wing -->
        <path
          d="M38 42 L7 83 L34 77 L43 55 Z"
          fill="${dark}"
          stroke="${main}"
          stroke-width="2"
        />

        <!-- Right wing -->
        <path
          d="M62 42 L93 83 L66 77 L57 55 Z"
          fill="${dark}"
          stroke="${main}"
          stroke-width="2"
        />

        <!-- Main spacecraft body -->
        <path
          d="M50 5
             C36 21 30 42 31 70
             L39 91
             L50 83
             L61 91
             L69 70
             C70 42 64 21 50 5 Z"
          fill="url(#body-${theme})"
          stroke="${light}"
          stroke-width="2.2"
          stroke-linejoin="round"
        />

        <!-- Cockpit -->
        <path
          d="M50 27
             C40 35 39 49 42 59
             L50 65
             L58 59
             C61 49 60 35 50 27 Z"
          fill="url(#glass-${theme})"
          stroke="#ffffff"
          stroke-width="1.8"
        />

        <!-- Cockpit highlight -->
        <path
          d="M45 38 Q48 32 53 35"
          fill="none"
          stroke="#ffffff"
          stroke-width="2"
          stroke-linecap="round"
          opacity=".85"
        />

        <!-- Wing lights -->
        <circle cx="24" cy="75" r="3" fill="${light}"/>
        <circle cx="76" cy="75" r="3" fill="${light}"/>

        <!-- Body details -->
        <path
          d="M50 68 L50 80"
          stroke="#ffffff"
          stroke-width="2"
          opacity=".8"
        />

        <path
          d="M37 85 L31 94 M63 85 L69 94"
          stroke="${main}"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
    `;
  }

  function lockedShipSvg() {
    return `
      <svg
        class="locked-ship-svg"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Locked"
      >
        <rect
          x="6" y="14" width="20" height="15"
          rx="3"
          fill="#72819c"
        />
        <path
          d="M10 14 V10 A6 6 0 0 1 22 10 V14"
          fill="none"
          stroke="#aebbd0"
          stroke-width="3"
        />
        <circle cx="16" cy="21" r="2" fill="#ffffff"/>
      </svg>
    `;
  }

  function getSelectedShip() {
    return ships[
      clamp(data.selectedShip, 0, ships.length - 1)
    ];
  }

  function renderHangar() {
    if (!elements.shipGrid) return;

    const ship = getSelectedShip();

    if (elements.selectedShip) {
      elements.selectedShip.innerHTML = shipSvg(ship.theme);
    }

    safeText(elements.shipName, ship.name);
    safeText(elements.shipDescription, ship.description);

    elements.shipGrid.replaceChildren();

    ships.forEach((item, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "ship-option";

      if (index === data.selectedShip) {
        button.classList.add("selected");
      }

      if (!data.unlockedShips.includes(index)) {
        button.innerHTML = lockedShipSvg();
        button.title = "Locked spacecraft";
        button.disabled = true;
      } else {
        button.innerHTML = shipSvg(item.theme);
        button.title = item.name;
        button.setAttribute(
          "aria-label",
          `Select ${item.name}`
        );

        button.addEventListener("click", () => {
          selectShip(index);
        });
      }

      elements.shipGrid.appendChild(button);
    });

    if (elements.playerShip) {
      elements.playerShip.innerHTML =
        shipSvg(ship.theme);
    }
  }

  function selectShip(index) {
    if (!data.unlockedShips.includes(index)) return;

    data.selectedShip = index;

    saveData();
    renderHangar();
  }

  if (elements.prevShip) {
    elements.prevShip.addEventListener("click", () => {
      for (let step = 1; step <= ships.length; step++) {
        const index =
          (data.selectedShip - step + ships.length) %
          ships.length;

        if (data.unlockedShips.includes(index)) {
          selectShip(index);
          return;
        }
      }
    });
  }

  if (elements.nextShip) {
    elements.nextShip.addEventListener("click", () => {
      for (let step = 1; step <= ships.length; step++) {
        const index =
          (data.selectedShip + step) % ships.length;

        if (data.unlockedShips.includes(index)) {
          selectShip(index);
          return;
        }
      }
    });
  }

  /* ----------------------------------------------------------
     10. MATH QUESTIONS
     ---------------------------------------------------------- */

  function createQuestion() {
    if (game.gameOver) return;

    const level = game.level;

    let a;
    let b;
    let operator;
    let answer;

    const operations = ["+", "-", "*"];

    if (level >= 4) {
      operations.push("/");
    }

    operator = operations[
      randomInt(0, operations.length - 1)
    ];

    if (operator === "+") {
      a = randomInt(2, 30 + level * 4);
      b = randomInt(2, 25 + level * 3);
      answer = a + b;
    } else if (operator === "-") {
      a = randomInt(5, 40 + level * 4);
      b = randomInt(1, a);
      answer = a - b;
    } else if (operator === "*") {
      // Multiplication stays within the 12 times tables.
      a = randomInt(1, 12);
      b = randomInt(1, 12);
      answer = a * b;
    } else {
      b = randomInt(1, 12);
      answer = randomInt(1, 12);
      a = b * answer;
    }

    const wrongAnswers = new Set();

    while (wrongAnswers.size < 2) {
      const offset = operator === "*"
        ? randomInt(-12, 12)
        : randomInt(-10, 10);

      const wrong = answer + offset;

      if (
        wrong !== answer &&
        wrong >= 0 &&
        wrong <= 999
      ) {
        wrongAnswers.add(wrong);
      }
    }

    const options = shuffle([
      answer,
      ...wrongAnswers
    ]);

    game.currentQuestion = {
      text: `${a} ${operator} ${b} = ?`,
      answer,
      options
    };

    safeText(elements.question, game.currentQuestion.text);

    /*
      FIX:
      All three targets use the exact same starting Y position.
      Their X positions remain spread across the arena.
      This keeps them aligned in one horizontal row.
    */

    const sharedStartY = -TARGET_SIZE;

    game.targets = options.map((value, index) => ({
      value,
      index,
      x: GAME_WIDTH * (index + 1) / 4,
      y: sharedStartY,
      speed: 75 + game.level * 9,
      element: elements.answerTargets[index]
    }));

    renderTargets();
  }

  /* ----------------------------------------------------------
     11. TARGET DISPLAY
     ---------------------------------------------------------- */

  function renderTargets() {
    const scale = getArenaScale();

    game.targets.forEach((target) => {
      const element = target.element;
      if (!element) return;

      element.textContent = target.value;

      element.style.left =
        `${(target.x / GAME_WIDTH) * 100}%`;

      element.style.top =
        `${target.y * scale.y}px`;

      element.style.display = "grid";
    });
  }

  function clearTargets() {
    game.targets = [];

    elements.answerTargets.forEach((element) => {
      if (!element) return;

      element.textContent = "";
      element.style.display = "none";
    });
  }

  /* ----------------------------------------------------------
     12. HUD AND MESSAGES
     ---------------------------------------------------------- */

  function updateHUD() {
    safeText(elements.score, game.score);
    safeText(elements.lives, game.lives);
    safeText(elements.level, game.level);
    safeText(elements.streak, game.streak);
  }

  function showToast(message, duration = 900) {
    if (!elements.toast) return;

    safeText(elements.toast, message);
    elements.toast.style.opacity = "1";

    game.toastTimer = duration;
  }

  function hideToast() {
    if (elements.toast) {
      elements.toast.style.opacity = "0";
    }
  }

  /* ----------------------------------------------------------
     13. GAME RESET AND START
     ---------------------------------------------------------- */

  function resetGame() {
    stopGameLoop();

    game.running = false;
    game.paused = false;
    game.gameOver = false;

    game.score = 0;
    game.lives = 3;
    game.level = 1;

    game.streak = 0;
    game.correctCount = 0;

    game.playerX = GAME_WIDTH / 2;
    game.playerY = GAME_HEIGHT - 50;

    game.targets = [];
    game.bullets = [];
    game.currentQuestion = null;

    game.lastTime = 0;
    game.lastShot = 0;

    game.movingLeft = false;
    game.movingRight = false;
    game.fireHeld = false;

    game.transitionTimer = 0;
    game.toastTimer = 0;

    clearTargets();
    clearBullets();
    hideToast();

    elements.startOverlay.classList.remove("hidden");
    elements.pauseOverlay.classList.add("hidden");
    elements.overOverlay.classList.add("hidden");

    elements.transitionOverlay.style.opacity = "0";

    updateHUD();
    updatePlayerPosition();
  }

  function startGame() {
    resetGame();

    game.running = true;

    elements.startOverlay.classList.add("hidden");
    elements.pauseOverlay.classList.add("hidden");
    elements.overOverlay.classList.add("hidden");

    game.playerX = GAME_WIDTH / 2;
    game.playerY = GAME_HEIGHT - 50;

    createQuestion();

    updateHUD();
    updatePlayerPosition();

    startMusic();
    playSound(620, 0.12);

    startGameLoop();
  }

  /* ----------------------------------------------------------
     14. PAUSE AND RESUME
     ---------------------------------------------------------- */

  function pauseGame() {
    if (!game.running || game.gameOver) return;

    game.paused = true;
    game.running = false;

    game.movingLeft = false;
    game.movingRight = false;
    game.fireHeld = false;

    stopGameLoop();

    elements.pauseOverlay.classList.remove("hidden");
  }

  function resumeGame() {
    if (!game.paused || game.gameOver) return;

    game.paused = false;
    game.running = true;

    elements.pauseOverlay.classList.add("hidden");

    game.lastTime = performance.now();

    startGameLoop();
  }

  /* ----------------------------------------------------------
     15. PLAYER POSITION
     ---------------------------------------------------------- */

  function updatePlayerPosition() {
    if (!elements.playerShip) return;

    elements.playerShip.style.left =
      `${(game.playerX / GAME_WIDTH) * 100}%`;

    elements.playerShip.style.bottom =
      `${((GAME_HEIGHT - game.playerY - PLAYER_SIZE / 2) / GAME_HEIGHT) * 100}%`;
  }

  function movePlayerToClientX(clientX) {
    const rect = elements.arena.getBoundingClientRect();

    if (rect.width <= 0) return;

    const relativeX = clientX - rect.left;
    const x = (relativeX / rect.width) * GAME_WIDTH;

    game.playerX = clamp(
      x,
      PLAYER_SIZE / 2,
      GAME_WIDTH - PLAYER_SIZE / 2
    );

    updatePlayerPosition();
  }

  /* ----------------------------------------------------------
     16. SHOOTING
     ---------------------------------------------------------- */

  function createBullet() {
    if (!game.running || game.paused || game.gameOver) {
      return;
    }

    const now = performance.now();

    if (now - game.lastShot < 260) return;

    game.lastShot = now;

    game.bullets.push({
      x: game.playerX,
      y: game.playerY - 25,
      speed: 540,
      element: null
    });

    playSound(780, 0.045);
  }

  function renderBullets() {
    const scale = getArenaScale();

    game.bullets.forEach((bullet) => {
      if (!bullet.element) {
        const laser = document.createElement("div");

        laser.className = "laser";

        laser.style.position = "absolute";
        laser.style.width = "4px";
        laser.style.height = "18px";
        laser.style.borderRadius = "5px";
        laser.style.background = "#35f5ff";
        laser.style.boxShadow = "0 0 12px #35f5ff";
        laser.style.pointerEvents = "none";

        elements.laserLayer.appendChild(laser);

        bullet.element = laser;
      }

      bullet.element.style.left =
        `${(bullet.x / GAME_WIDTH) * 100}%`;

      bullet.element.style.top =
        `${bullet.y * scale.y}px`;

      bullet.element.style.transform = "translateX(-50%)";
    });
  }

  function clearBullets() {
    game.bullets.forEach((bullet) => {
      if (bullet.element) {
        bullet.element.remove();
      }
    });

    game.bullets = [];
  }

  /* ----------------------------------------------------------
     17. COLLISION
     ---------------------------------------------------------- */

  function checkCollision(bullet, target) {
    const scale = getArenaScale();

    const targetWidth =
      target.element?.offsetWidth || TARGET_SIZE;

    const targetHeight =
      target.element?.offsetHeight || TARGET_SIZE;

    const bulletWidth = 4;
    const bulletHeight = 18;

    const dxPixels =
      Math.abs(bullet.x - target.x) * scale.x;

    const bulletCenterY = bullet.y + bulletHeight / 2;

    const targetCenterY =
      target.y + targetHeight / (2 * scale.y);

    const dyPixels =
      Math.abs(bulletCenterY - targetCenterY) * scale.y;

    return (
      dxPixels < targetWidth / 2 + bulletWidth / 2 &&
      dyPixels < targetHeight / 2 + bulletHeight / 2
    );
  }

  /* ----------------------------------------------------------
     18. ANSWER HANDLING
     ---------------------------------------------------------- */

  function handleTargetHit(target) {
    if (!game.running || game.gameOver) return;

    const correct =
      target.value === game.currentQuestion.answer;

    if (correct) {
      game.score += 10;
      game.correctCount++;
      game.streak++;

      data.totalCorrect++;

      data.bestStreak = Math.max(
        data.bestStreak,
        game.streak
      );

      showToast("CORRECT! +10");
      playSound(950, 0.12);

      checkAchievements();

      const nextLevel =
        Math.floor(game.score / 100) + 1;

      if (nextLevel > game.level) {
        game.level = nextLevel;

        showTransition(`LEVEL ${game.level}`);

        game.lives = Math.min(5, game.lives + 1);
      }

      createQuestion();
    } else {
      game.streak = 0;

      loseLife("WRONG ANSWER!");

      if (game.running && !game.gameOver) {
        createQuestion();
      }
    }

    updateHUD();
    updateProfile();
    saveData();
  }

  function loseLife(reason) {
    if (game.gameOver) return;

    game.lives = Math.max(0, game.lives - 1);

    showToast(reason, 850);
    playSound(180, 0.18);

    updateHUD();

    if (game.lives <= 0) {
      endGame();
    }
  }

  /* ----------------------------------------------------------
     19. LEVEL TRANSITION
     ---------------------------------------------------------- */

  function showTransition(message) {
    safeText(elements.transitionText, message);

    elements.transitionOverlay.style.opacity = "1";

    game.transitionTimer = 1100;

    playSound(1100, 0.2);
  }

  /* ----------------------------------------------------------
     20. GAME UPDATE
     ---------------------------------------------------------- */

  function updateGame(deltaTime) {
    if (!game.running || game.paused || game.gameOver) {
      return;
    }

    const dt = Math.min(deltaTime, 0.05);

    if (game.movingLeft) {
      game.playerX -= game.playerSpeed * dt;
    }

    if (game.movingRight) {
      game.playerX += game.playerSpeed * dt;
    }

    game.playerX = clamp(
      game.playerX,
      PLAYER_SIZE / 2,
      GAME_WIDTH - PLAYER_SIZE / 2
    );

    updatePlayerPosition();

    if (game.fireHeld) {
      createBullet();
    }

    // All targets fall at the same speed.
    game.targets.forEach((target) => {
      target.y += target.speed * dt;
    });

    game.bullets.forEach((bullet) => {
      bullet.y -= bullet.speed * dt;
    });

    let targetWasHit = false;

    for (let i = game.bullets.length - 1; i >= 0; i--) {
      const bullet = game.bullets[i];

      for (let j = game.targets.length - 1; j >= 0; j--) {
        const target = game.targets[j];

        if (checkCollision(bullet, target)) {
          if (bullet.element) {
            bullet.element.remove();
          }

          game.bullets.splice(i, 1);

          clearBullets();

          handleTargetHit(target);

          targetWasHit = true;
          break;
        }
      }

      if (targetWasHit) break;
    }

    if (!targetWasHit) {
      const remainingBullets = [];

      game.bullets.forEach((bullet) => {
        if (bullet.y < -30) {
          if (bullet.element) {
            bullet.element.remove();
          }
        } else {
          remainingBullets.push(bullet);
        }
      });

      game.bullets = remainingBullets;

      const escaped = game.targets.some(
        (target) => target.y > GAME_HEIGHT - 20
      );

      if (escaped && game.running) {
        loseLife("TARGET ESCAPED!");

        if (game.running && !game.gameOver) {
          createQuestion();
        }
      }
    }

    renderTargets();
    renderBullets();

    if (game.toastTimer > 0) {
      game.toastTimer -= dt * 1000;

      if (game.toastTimer <= 0) {
        hideToast();
      }
    }

    if (game.transitionTimer > 0) {
      game.transitionTimer -= dt * 1000;

      if (game.transitionTimer <= 0) {
        elements.transitionOverlay.style.opacity = "0";
      }
    }

    updateHUD();
  }

  /* ----------------------------------------------------------
     21. GAME LOOP
     ---------------------------------------------------------- */

  function gameLoop(timestamp) {
    if (!game.running || game.paused || game.gameOver) {
      return;
    }

    if (!game.lastTime) {
      game.lastTime = timestamp;
    }

    const deltaTime =
      (timestamp - game.lastTime) / 1000;

    game.lastTime = timestamp;

    updateGame(deltaTime);

    if (game.running && !game.paused && !game.gameOver) {
      game.animationFrame = requestAnimationFrame(gameLoop);
    }
  }

  function startGameLoop() {
    stopGameLoop();

    game.lastTime = performance.now();

    game.animationFrame = requestAnimationFrame(gameLoop);
  }

  function stopGameLoop() {
    if (game.animationFrame !== null) {
      cancelAnimationFrame(game.animationFrame);
      game.animationFrame = null;
    }
  }

  /* ----------------------------------------------------------
     22. GAME OVER
     ---------------------------------------------------------- */

  async function endGame() {
    if (game.gameOver) return;

    game.gameOver = true;
    game.running = false;
    game.paused = false;

    stopGameLoop();

    game.movingLeft = false;
    game.movingRight = false;
    game.fireHeld = false;

    clearBullets();

    data.bestScore = Math.max(
      data.bestScore,
      game.score
    );

    data.bestStreak = Math.max(
      data.bestStreak,
      game.streak
    );

    saveData();

    safeText(
      elements.finalStats,
      `Score: ${game.score} | Correct: ${game.correctCount} | Level: ${game.level}`
    );

    elements.startOverlay.classList.add("hidden");
    elements.pauseOverlay.classList.add("hidden");
    elements.overOverlay.classList.remove("hidden");

    updateProfile();

    updateHUD();

    checkAchievements();
    saveData();

    if (game.score > 0) {
      await submitOnlineScore();
    }
  }

  /* ----------------------------------------------------------
     23. ACHIEVEMENTS
     ---------------------------------------------------------- */

  const achievements = [
    {
      id: "first",
      icon: "🌟",
      name: "FIRST FLIGHT",
      description: "Answer your first question.",
      condition: () => data.totalCorrect >= 1
    },
    {
      id: "score100",
      icon: "💯",
      name: "CENTURY",
      description: "Reach 100 points in one game.",
      condition: () => game.score >= 100
    },
    {
      id: "score500",
      icon: "🚀",
      name: "SPACE EXPLORER",
      description: "Reach 500 points in one game.",
      condition: () => game.score >= 500
    },
    {
      id: "correct25",
      icon: "🧠",
      name: "MATH MASTER",
      description: "Answer 25 questions correctly.",
      condition: () => data.totalCorrect >= 25
    },
    {
      id: "streak10",
      icon: "🔥",
      name: "UNSTOPPABLE",
      description: "Reach a streak of 10.",
      condition: () => game.streak >= 10
    },
    {
      id: "level5",
      icon: "🌌",
      name: "GALACTIC PILOT",
      description: "Reach level 5.",
      condition: () => game.level >= 5
    }
  ];

  function checkAchievements() {
    achievements.forEach((achievement) => {
      if (
        !data.achievements.includes(achievement.id) &&
        achievement.condition()
      ) {
        data.achievements.push(achievement.id);

        showToast(`ACHIEVEMENT: ${achievement.name}`);
        playSound(1200, 0.15);
      }
    });

    renderAchievements();
    saveData();
  }

  function renderAchievements() {
    if (!elements.achievementGrid) return;

    elements.achievementGrid.replaceChildren();

    achievements.forEach((achievement) => {
      const unlocked =
        data.achievements.includes(achievement.id);

      const card = document.createElement("article");
      card.className = "achievement-card";

      if (unlocked) {
        card.classList.add("unlocked");
      }

      const icon = document.createElement("div");
      icon.className = "achievement-icon";
      icon.textContent = achievement.icon;

      const title = document.createElement("h3");
      title.textContent = achievement.name;

      const description = document.createElement("p");
      description.textContent = achievement.description;

      const status = document.createElement("p");
      status.textContent = unlocked
        ? "✓ UNLOCKED"
        : "🔒 LOCKED";

      card.append(icon, title, description, status);
      elements.achievementGrid.appendChild(card);
    });
  }

   /* ----------------------------------------------------------
     24. PROFILE — SVG ASTRONAUT
     ---------------------------------------------------------- */

  function renderProfileAstronaut() {
    const profilePage = $("profile");

    if (!profilePage) return;

    // Remove old astronaut/rocket emoji text from the profile page.
    const walker = document.createTreeWalker(
      profilePage,
      NodeFilter.SHOW_TEXT
    );

    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
      node.nodeValue = node.nodeValue.replace(
        /[🧑‍🚀👨‍🚀👩‍🚀🚀]/gu,
        ""
      );
    });

    let avatar = $("profileAstronautVisual");

    if (!avatar) {
      avatar = document.createElement("div");
      avatar.id = "profileAstronautVisual";
      avatar.className = "profile-astronaut-visual";

      profilePage.insertBefore(
        avatar,
        profilePage.firstChild
      );
    }

    avatar.innerHTML = `
      <svg
        viewBox="0 0 160 160"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Astronaut illustration"
      >
        <defs>
          <linearGradient id="suit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#a7c5e8"/>
          </linearGradient>

          <linearGradient id="helmet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#35f5ff"/>
            <stop offset="100%" stop-color="#5947d9"/>
          </linearGradient>
        </defs>

        <!-- Backpack -->
        <rect
          x="34" y="75" width="25" height="48"
          rx="10"
          fill="#7286a9"
          stroke="#dcecff"
          stroke-width="3"
        />

        <!-- Astronaut suit -->
        <path
          d="M51 91
             Q80 74 109 91
             L121 137
             Q80 153 39 137 Z"
          fill="url(#suit)"
          stroke="#ffffff"
          stroke-width="3"
        />

        <!-- Suit chest panel -->
        <rect
          x="65" y="105" width="30" height="22"
          rx="6"
          fill="#233d72"
          stroke="#35f5ff"
          stroke-width="2"
        />

        <circle cx="80" cy="116" r="4" fill="#35f5ff"/>

        <!-- Helmet -->
        <circle
          cx="80" cy="62" r="42"
          fill="url(#suit)"
          stroke="#ffffff"
          stroke-width="4"
        />

        <!-- Visor -->
        <ellipse
          cx="80" cy="64" rx="31" ry="28"
          fill="#102b58"
          stroke="#35f5ff"
          stroke-width="3"
        />

        <!-- Visor reflection -->
        <path
          d="M59 53 Q69 39 83 42"
          fill="none"
          stroke="#ffffff"
          stroke-width="4"
          stroke-linecap="round"
          opacity=".8"
        />

        <!-- Shoulder details -->
        <circle cx="48" cy="105" r="7" fill="#35f5ff"/>
        <circle cx="112" cy="105" r="7" fill="#35f5ff"/>

        <!-- Helmet side details -->
        <rect x="35" y="55" width="8" height="17" rx="3" fill="#a9c7e8"/>
        <rect x="117" y="55" width="8" height="17" rx="3" fill="#a9c7e8"/>
      </svg>
    `;
  }

  function updateProfile() {
    if (elements.nickname) {
      elements.nickname.value = data.nickname;
    }

    safeText(elements.profileBest, data.bestScore);
    safeText(elements.profileCorrect, data.totalCorrect);
    safeText(elements.profileStreak, data.bestStreak);

    renderProfileAstronaut();
  }
     // SAVE PLAYER NICKNAME
  if (elements.saveNick && elements.nickname) {
    function saveNickname() {
      const nickname = elements.nickname.value
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 16);

      if (!nickname) {
        alert("Please enter a nickname.");
        elements.nickname.focus();
        return;
      }

      data.nickname = nickname;
      saveData();
      updateProfile();

      elements.saveNick.textContent = "SAVED ✓";

      window.setTimeout(() => {
        elements.saveNick.textContent = "SAVE";
      }, 1500);
    }

    elements.saveNick.addEventListener(
      "click",
      saveNickname
    );

    elements.nickname.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        saveNickname();
      }
    });
  }

  /* ----------------------------------------------------------
     25. SETTINGS
     ---------------------------------------------------------- */

  function loadSettings() {
    const settings = data.settings;

    if (elements.musicVolume) {
      elements.musicVolume.value = settings.musicVolume;
    }

    if (elements.sfxVolume) {
      elements.sfxVolume.value = settings.sfxVolume;
    }

    if (elements.reducedMotion) {
      elements.reducedMotion.checked =
        settings.reducedMotion;
    }

    if (elements.mute) {
      elements.mute.checked = settings.mute;
    }

    document.body.classList.toggle(
      "reduced-motion",
      settings.reducedMotion
    );

    updateAudioSettings();
  }

  if (elements.musicVolume) {
    elements.musicVolume.addEventListener("input", () => {
      data.settings.musicVolume =
        Number(elements.musicVolume.value);

      updateAudioSettings();
      saveData();
    });
  }

  if (elements.sfxVolume) {
    elements.sfxVolume.addEventListener("input", () => {
      data.settings.sfxVolume =
        Number(elements.sfxVolume.value);

      saveData();
    });
  }

  if (elements.reducedMotion) {
    elements.reducedMotion.addEventListener("change", () => {
      data.settings.reducedMotion =
        elements.reducedMotion.checked;

      document.body.classList.toggle(
        "reduced-motion",
        data.settings.reducedMotion
      );

      saveData();
    });
  }

  if (elements.mute) {
    elements.mute.addEventListener("change", () => {
      data.settings.mute = elements.mute.checked;

      updateAudioSettings();
      saveData();
    });
  }

  if (elements.clearLocal) {
    elements.clearLocal.addEventListener("click", () => {
      const confirmed = confirm(
        "Clear your local game progress and settings? This does not delete your online account or online scores."
      );

      if (!confirmed) return;

      localStorage.removeItem(STORAGE_KEY);

      data = cloneDefaultData();

      resetGame();
      loadSettings();
      updateProfile();
      renderHangar();
      renderAchievements();

      alert("Local game data has been reset.");
    });
  }

  /* ----------------------------------------------------------
     26. KEYBOARD CONTROLS
     ---------------------------------------------------------- */

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "ArrowLeft" ||
      event.key.toLowerCase() === "a"
    ) {
      event.preventDefault();
      game.movingLeft = true;
    }

    if (
      event.key === "ArrowRight" ||
      event.key.toLowerCase() === "d"
    ) {
      event.preventDefault();
      game.movingRight = true;
    }

    if (event.code === "Space") {
      event.preventDefault();

      if (!game.running && !game.paused && !game.gameOver) {
        startGame();
      }

      game.fireHeld = true;
    }

    if (event.key === "Escape" && game.running) {
      pauseGame();
    }
  });

  document.addEventListener("keyup", (event) => {
    if (
      event.key === "ArrowLeft" ||
      event.key.toLowerCase() === "a"
    ) {
      game.movingLeft = false;
    }

    if (
      event.key === "ArrowRight" ||
      event.key.toLowerCase() === "d"
    ) {
      game.movingRight = false;
    }

    if (event.code === "Space") {
      game.fireHeld = false;
    }
  });

  window.addEventListener("blur", () => {
    game.movingLeft = false;
    game.movingRight = false;
    game.fireHeld = false;

    if (game.running) {
      pauseGame();
    }
  });

  /* ----------------------------------------------------------
     27. MOBILE CONTROLS
     ---------------------------------------------------------- */

  function bindHoldButton(button, onStart, onEnd) {
    if (!button) return;

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();

      try {
        button.setPointerCapture(event.pointerId);
      } catch (_) {}

      onStart();
    });

    button.addEventListener("pointerup", (event) => {
      event.preventDefault();
      onEnd();
    });

    button.addEventListener("pointercancel", onEnd);
    button.addEventListener("lostpointercapture", onEnd);
  }

  bindHoldButton(
    elements.leftBtn,
    () => {
      game.movingLeft = true;
    },
    () => {
      game.movingLeft = false;
    }
  );

  bindHoldButton(
    elements.rightBtn,
    () => {
      game.movingRight = true;
    },
    () => {
      game.movingRight = false;
    }
  );

  bindHoldButton(
    elements.fireBtn,
    () => {
      game.fireHeld = true;
    },
    () => {
      game.fireHeld = false;
    }
  );

  if (elements.arena) {
    elements.arena.addEventListener("pointerdown", (event) => {
      if (!game.running || game.paused) return;

      if (
        event.target.closest(".game-overlay") ||
        event.target.closest("button") ||
        event.target.closest(".answer-target")
      ) {
        return;
      }

      movePlayerToClientX(event.clientX);
    });
  }

  /* ----------------------------------------------------------
     28. GAME BUTTONS
     ---------------------------------------------------------- */

  elements.startBtn.addEventListener("click", startGame);
  elements.againBtn.addEventListener("click", startGame);
  elements.pauseBtn.addEventListener("click", pauseGame);
  elements.resumeBtn.addEventListener("click", resumeGame);

  /* ----------------------------------------------------------
     29. SUPABASE INITIALIZATION
     ---------------------------------------------------------- */

  let supabase = null;
  let currentUser = null;

  function initializeSupabase() {
    if (
      !window.supabase ||
      !window.supabase.createClient
    ) {
      safeText(
        elements.connection,
        "Online service library could not load. Local game is available."
      );

      updateAuthUI(null);
      return;
    }

    try {
      supabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

      supabase.auth.onAuthStateChange(
        (_event, session) => {
          currentUser = session?.user || null;
          updateAuthUI(currentUser);
        }
      );

      supabase.auth.getSession().then(({ data: result, error }) => {
        if (error) {
          console.error("Session check failed:", error.message);
          return;
        }

        currentUser = result.session?.user || null;
        updateAuthUI(currentUser);
      });

      safeText(elements.connection, "Online service initialized.");
    } catch (error) {
      console.error("Supabase initialization failed:", error);

      supabase = null;

      safeText(
        elements.connection,
        "Online service unavailable. Local game is available."
      );
    }
  }

  /* ----------------------------------------------------------
     30. AUTHENTICATION UI
     ---------------------------------------------------------- */

  function updateAuthUI(user) {
    currentUser = user || null;

    if (elements.authStatus) {
      elements.authStatus.textContent = user
        ? "Signed in"
        : "Not signed in";
    }

    if (elements.signOutBtn) {
      elements.signOutBtn.classList.toggle(
        "hidden",
        !user
      );
    }

    if (elements.signInBtn) {
      elements.signInBtn.classList.toggle(
        "hidden",
        Boolean(user)
      );
    }

    if (elements.signUpBtn) {
      elements.signUpBtn.classList.toggle(
        "hidden",
        Boolean(user)
      );
    }

    if (user?.email) {
      setMessage(`Signed in as ${user.email}`);
    }

    if (elements.connection) {
      elements.connection.textContent = user
        ? "Signed in — online scores enabled."
        : "Not signed in — online score submission requires an account.";
    }
  }

  function getAuthInputs() {
    const email =
      elements.authEmail?.value.trim() || "";

    const password =
      elements.authPassword?.value || "";

    if (!email || !password) {
      setMessage("Enter your email and password.", true);
      return null;
    }

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters.",
        true
      );
      return null;
    }

    return { email, password };
  }

  async function signUp() {
    if (!supabase) {
      setMessage("Online service is unavailable.", true);
      return;
    }

    const inputs = getAuthInputs();
    if (!inputs) return;

    elements.signUpBtn.disabled = true;
    setMessage("Creating your account...");

    try {
      const { data: result, error } =
        await supabase.auth.signUp({
          email: inputs.email,
          password: inputs.password,
          options: {
            emailRedirectTo:
              "https://neonshooterbyvetrivelproductions.pages.dev/"
          }
        });

      if (error) throw error;

      if (result.session) {
        currentUser = result.user;
        updateAuthUI(currentUser);
        setMessage("Account created and signed in!");
      } else {
        setMessage(
          "Account created. Check your email for the confirmation link."
        );
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      setMessage(
        error.message || "Account creation failed.",
        true
      );
    } finally {
      elements.signUpBtn.disabled = false;
    }
  }

  async function signIn() {
    if (!supabase) {
      setMessage("Online service is unavailable.", true);
      return;
    }

    const inputs = getAuthInputs();
    if (!inputs) return;

    elements.signInBtn.disabled = true;
    setMessage("Signing in...");

    try {
      const { data: result, error } =
        await supabase.auth.signInWithPassword({
          email: inputs.email,
          password: inputs.password
        });

      if (error) throw error;

      currentUser = result.user;
      updateAuthUI(currentUser);

      setMessage("Welcome back!");
    } catch (error) {
      console.error("Sign-in error:", error);
      setMessage(
        error.message || "Sign-in failed.",
        true
      );
    } finally {
      elements.signInBtn.disabled = false;
    }
  }

  async function signOut() {
    if (!supabase) return;

    elements.signOutBtn.disabled = true;

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      currentUser = null;
      updateAuthUI(null);

      setMessage("You have signed out.");
    } catch (error) {
      console.error("Sign-out error:", error);
      setMessage(
        error.message || "Sign-out failed.",
        true
      );
    } finally {
      elements.signOutBtn.disabled = false;
    }
  }

  if (elements.signUpBtn) {
    elements.signUpBtn.addEventListener("click", signUp);
  }

  if (elements.signInBtn) {
    elements.signInBtn.addEventListener("click", signIn);
  }

  if (elements.signOutBtn) {
    elements.signOutBtn.addEventListener("click", signOut);
  }

  /* ----------------------------------------------------------
     31. ONLINE SCORE SUBMISSION
     ---------------------------------------------------------- */

  async function submitOnlineScore() {
    if (!supabase || !currentUser) {
      console.info(
        "Score not submitted: player is not signed in."
      );
      return;
    }

    try {
      const { data: sessionResult, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionResult.session) {
        setMessage("Sign in to submit your score.");
        return;
      }

      setMessage("Submitting your score...");

      const { data: result, error } =
        await supabase.functions.invoke(
          SCORE_FUNCTION_NAME,
          {
            body: {
              name: data.nickname,
              score: game.score
            }
          }
        );

      if (error) throw error;

      if (result?.error) {
        throw new Error(result.error);
      }

      setMessage("Your score was submitted!");

      loadLeaderboard();
    } catch (error) {
      console.error("Score submission failed:", error);

      setMessage(
        "Score could not be submitted: " + error.message,
        true
      );
    }
  }

  /* ----------------------------------------------------------
     32. ONLINE LEADERBOARD
     ---------------------------------------------------------- */

  async function loadLeaderboard() {
    if (!elements.scoresList) return;

    elements.scoresList.replaceChildren();

    const loading = document.createElement("p");
    loading.className = "empty-message";
    loading.textContent = "Loading leaderboard...";

    elements.scoresList.appendChild(loading);

    if (!supabase) {
      loading.textContent =
        "Online leaderboard unavailable. Check your connection.";
      return;
    }

    try {
      const { data: scores, error } = await supabase
        .from("scores")
        .select("display_name, score, created_at")
        .order("score", { ascending: false })
        .limit(10);

      if (error) throw error;

      elements.scoresList.replaceChildren();

      if (!scores || scores.length === 0) {
        const empty = document.createElement("p");

        empty.className = "empty-message";
        empty.textContent =
          "No scores yet. Be the first player!";

        elements.scoresList.appendChild(empty);
        return;
      }

      scores.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "score-row";

        const rank = document.createElement("span");
        rank.className = "score-rank";
        rank.textContent = `#${index + 1}`;

        const name = document.createElement("span");
        name.className = "score-name";
        name.textContent = item.display_name || "Player";

        const score = document.createElement("span");
        score.className = "score-value";
        score.textContent =
          Number(item.score).toLocaleString();

        row.append(rank, name, score);
        elements.scoresList.appendChild(row);
      });
    } catch (error) {
      console.error("Leaderboard loading failed:", error);

      elements.scoresList.replaceChildren();

      const message = document.createElement("p");
      message.className = "empty-message";
      message.textContent =
        "Could not load online scores. Please try again later.";

      elements.scoresList.appendChild(message);
    }
  }

  /* ----------------------------------------------------------
     33. SERVICE WORKER
     ---------------------------------------------------------- */

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    if (
      location.protocol !== "https:" &&
      location.hostname !== "localhost"
    ) {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then((registration) => {
          console.info(
            "Service worker registered:",
            registration.scope
          );
        })
        .catch((error) => {
          console.warn(
            "Service worker registration failed:",
            error
          );
        });
    });
  }

  /* ----------------------------------------------------------
     34. INITIALIZATION
     ---------------------------------------------------------- */

  function initializeGame() {
    console.info("Neon Math Space Shooter starting...");

    updateHUD();
    updateProfile();

    loadSettings();

    renderHangar();
    renderAchievements();

    resetGame();

    initializeSupabase();
    registerServiceWorker();

    console.info("Neon Math Space Shooter initialized.");
  }

  initializeGame();

})();
