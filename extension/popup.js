const STORAGE_KEY = "daily-focus-extension-timer";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

function nowMs() {
  return Date.now();
}

function defaultState() {
  return {
    mode: "focus", // "focus" | "break"
    isRunning: false,
    endsAt: null, // epoch ms
    pausedRemainingSeconds: FOCUS_SECONDS,
    completedCount: 0,
  };
}

function computeRemainingSeconds(state) {
  if (state.isRunning && typeof state.endsAt === "number") {
    return Math.max(0, Math.ceil((state.endsAt - nowMs()) / 1000));
  }
  if (!state.isRunning && typeof state.pausedRemainingSeconds === "number") {
    return Math.max(0, state.pausedRemainingSeconds);
  }
  return state.mode === "break" ? BREAK_SECONDS : FOCUS_SECONDS;
}

function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function modeLabel(mode) {
  return mode === "break" ? "Break" : "Focus";
}

function statusLabel(state, remainingSeconds) {
  if (state.isRunning) return state.mode === "break" ? "休憩中" : "集中中";
  if (remainingSeconds === (state.mode === "break" ? BREAK_SECONDS : FOCUS_SECONDS)) return "開始待ち";
  if (remainingSeconds > 0) return "一時停止";
  return "完了";
}

async function readState() {
  const result = await chrome.storage.local.get([STORAGE_KEY]);
  return result[STORAGE_KEY] ?? defaultState();
}

async function writeState(next) {
  await chrome.storage.local.set({ [STORAGE_KEY]: next });
  return next;
}

function el(id) {
  const node = document.getElementById(id);
  if (!node) throw new Error(`missing element: ${id}`);
  return node;
}

const modeText = el("modeText");
const timeText = el("timeText");
const statusText = el("statusText");
const startPauseBtn = el("startPauseBtn");
const resetBtn = el("resetBtn");
const switchModeBtn = el("switchModeBtn");
const openAppLink = el("openAppLink");

let current = defaultState();
let tickTimer = null;

function render() {
  const remainingSeconds = computeRemainingSeconds(current);

  modeText.textContent = modeLabel(current.mode);
  timeText.textContent = formatTime(remainingSeconds);
  statusText.textContent = statusLabel(current, remainingSeconds);

  startPauseBtn.textContent = current.isRunning ? "Pause" : remainingSeconds === 0 ? "Restart" : "Start";
}

async function onStartPause() {
  const remainingSeconds = computeRemainingSeconds(current);

  if (current.isRunning) {
    current = await writeState({
      ...current,
      isRunning: false,
      endsAt: null,
      pausedRemainingSeconds: remainingSeconds,
    });
    render();
    return;
  }

  const nextRemainingSeconds =
    typeof current.pausedRemainingSeconds === "number" ? current.pausedRemainingSeconds : remainingSeconds;

  const nextDuration = nextRemainingSeconds > 0 ? nextRemainingSeconds : current.mode === "break" ? BREAK_SECONDS : FOCUS_SECONDS;
  current = await writeState({
    ...current,
    isRunning: true,
    endsAt: nowMs() + nextDuration * 1000,
    pausedRemainingSeconds: null,
  });
  render();
}

async function onReset() {
  current = await writeState({
    ...defaultState(),
  });
  render();
}

async function onSwitchMode() {
  const nextMode = current.mode === "break" ? "focus" : "break";
  const nextSeconds = nextMode === "break" ? BREAK_SECONDS : FOCUS_SECONDS;
  current = await writeState({
    ...current,
    mode: nextMode,
    isRunning: false,
    endsAt: null,
    pausedRemainingSeconds: nextSeconds,
  });
  render();
}

async function maybeHandleCompletion() {
  if (!current.isRunning) return;
  const remainingSeconds = computeRemainingSeconds(current);
  if (remainingSeconds > 0) return;

  // MVP: ポップアップが開いている間だけ自動で次モードへ（閉じている間は次回開いたときに反映）
  const nextMode = current.mode === "focus" ? "break" : "focus";
  const nextSeconds = nextMode === "break" ? BREAK_SECONDS : FOCUS_SECONDS;
  current = await writeState({
    ...current,
    mode: nextMode,
    isRunning: false,
    endsAt: null,
    pausedRemainingSeconds: nextSeconds,
    completedCount: current.mode === "focus" ? (current.completedCount ?? 0) + 1 : current.completedCount ?? 0,
  });
  render();
}

function startTick() {
  if (tickTimer) return;
  tickTimer = setInterval(async () => {
    render();
    await maybeHandleCompletion();
  }, 250);
}

function stopTick() {
  if (!tickTimer) return;
  clearInterval(tickTimer);
  tickTimer = null;
}

startPauseBtn.addEventListener("click", () => void onStartPause());
resetBtn.addEventListener("click", () => void onReset());
switchModeBtn.addEventListener("click", () => void onSwitchMode());
openAppLink.addEventListener("click", async (event) => {
  event.preventDefault();
  await chrome.tabs.create({ url: "http://localhost:3000" });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  const entry = changes[STORAGE_KEY];
  if (!entry) return;
  current = entry.newValue ?? defaultState();
  render();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") startTick();
  else stopTick();
});

// init
readState()
  .then((state) => {
    current = state;
    render();
    startTick();
  })
  .catch(() => {
    current = defaultState();
    render();
    startTick();
  });

