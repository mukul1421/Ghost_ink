const wordsInput = document.getElementById('wordsInput');
const wordsContainer = document.getElementById('words');
const wordsWrapper = document.getElementById('wordsWrapper');
const caret = document.getElementById('caret');
const restartBtn = document.getElementById('restart-btn');

let currentWordIndex = 0;
let typedWords = []; 

let testStarted = false;
let timeLeft = 30;
let timerInterval;
let correctCharCount = 0;
let totalKeystrokes = 0;

let wpmSamples = [];

let keystrokeLog = [];
let lastKeystrokeTime = null;

function renderWords(wordCount) {
  wordsContainer.innerHTML = '';
  currentWordIndex = 0;
  typedWords = [];

  const words = getRandomWords(wordCount);

  words.forEach(word => {
    const wordDiv = document.createElement('div');
    wordDiv.classList.add('word');

    [...word].forEach(letter => {
      const charSpan = document.createElement('span');
      charSpan.classList.add('char');
      charSpan.textContent = letter;
      wordDiv.appendChild(charSpan);
    });

    wordsContainer.appendChild(wordDiv);
  });
}

function getCurrentWordEl() {
  const wordElements = document.querySelectorAll('.word');
  return wordElements[currentWordIndex];
}

function checkTypedWord() {
  const typed = wordsInput.value;

  if (!testStarted) {
    testStarted = true;
    startTimer();
  }

  const now = performance.now();
  const delay = lastKeystrokeTime === null ? 0 : now - lastKeystrokeTime;

  keystrokeLog.push({
    char: typed[typed.length - 1],
    timestamp: now,
    delay: delay
  });

  lastKeystrokeTime = now;

  const currentWordEl = getCurrentWordEl();
  const letterEls = currentWordEl.querySelectorAll('.char:not(.extra)');

  letterEls.forEach((letterEl, index) => {
    const typedChar = typed[index];

    letterEl.classList.remove('correct', 'incorrect');

    if (typedChar == null) return;

    if (typedChar === letterEl.textContent) {
      letterEl.classList.add('correct');
    } else {
      letterEl.classList.add('incorrect');
    }
  });

  currentWordEl.querySelectorAll('.char.extra').forEach(el => el.remove());

  if (typed.length > letterEls.length) {
    const extraChars = typed.slice(letterEls.length);
    [...extraChars].forEach(char => {
      const extraSpan = document.createElement('span');
      extraSpan.classList.add('char', 'extra', 'incorrect');
      extraSpan.textContent = char;
      currentWordEl.appendChild(extraSpan);
    });
  }

  moveCaret();
}

function moveCaret() {
  const currentWordEl = getCurrentWordEl();
  if (!currentWordEl) return;

  const typed = wordsInput.value;
  const letterEls = currentWordEl.querySelectorAll('.char');

  const isPastEnd = typed.length >= letterEls.length;
  const targetLetter = isPastEnd
    ? letterEls[letterEls.length - 1]
    : letterEls[typed.length];

  const rect = targetLetter.getBoundingClientRect();
  const wrapperRect = wordsWrapper.getBoundingClientRect();

  const left = isPastEnd ? rect.right : rect.left;

  caret.style.left = `${left - wrapperRect.left}px`;
  caret.style.top = `${rect.top - wrapperRect.top}px`;
}

function goToNextWord() {
  const typed = wordsInput.value;
  if (typed.length === 0) return;

  typedWords[currentWordIndex] = typed;

  const currentWordEl = getCurrentWordEl();
  const letterEls = currentWordEl.querySelectorAll('.char:not(.extra)');

  letterEls.forEach((letterEl, index) => {
    totalKeystrokes++;
    if (typed[index] === letterEl.textContent) {
      correctCharCount++;
    }
  });

  totalKeystrokes++;
  correctCharCount++;

  currentWordEl.classList.add('completed');
  currentWordIndex++;
  wordsInput.value = '';

  moveCaret();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('stat-time').textContent = timeLeft;

    updateLiveStats();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      finishTest();
    }
  }, 1000);
}

function updateLiveStats() {
  const elapsedMinutes = (30 - timeLeft) / 60;
  const wpm = elapsedMinutes > 0 ? Math.round((correctCharCount / 5) / elapsedMinutes) : 0;
  const accuracy = totalKeystrokes > 0 ? Math.round((correctCharCount / totalKeystrokes) * 100) : 100;

  wpmSamples.push(wpm);

  document.getElementById('stat-wpm').textContent = wpm;
  document.getElementById('stat-accuracy').textContent = accuracy;
}

function calculateConsistency() {
  if (wpmSamples.length === 0) return 100;

  const average = wpmSamples.reduce((sum, val) => sum + val, 0) / wpmSamples.length;

  const squaredDiffs = wpmSamples.map(val => (val - average) ** 2);
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
  const standardDeviation = Math.sqrt(avgSquaredDiff);

  const coefficientOfVariation = average > 0 ? standardDeviation / average : 0;
  const consistency = Math.max(0, Math.round(100 - (coefficientOfVariation * 100)));

  return consistency;
}

function finishTest() {
  wordsInput.disabled = true;
  document.getElementById('results-panel').hidden = false;

  const finalWpm = document.getElementById('stat-wpm').textContent;
  const finalAccuracy = document.getElementById('stat-accuracy').textContent;
  const finalConsistency = calculateConsistency()

  document.getElementById('result-wpm').textContent = finalWpm;
  document.getElementById('result-accuracy').textContent = finalAccuracy;
  document.getElementById('result-consistency').textContent = finalConsistency; 
}

function goToPreviousWord() {
  if (currentWordIndex === 0) return; 

  currentWordIndex--;
  getCurrentWordEl().classList.remove('completed');

  wordsInput.value = typedWords[currentWordIndex] || '';

  checkTypedWord(); 
}

function focusInput() {
  wordsInput.focus();
}

function startTest() {
  clearInterval(timerInterval);
  testStarted = false;
  timeLeft = 30;
  correctCharCount = 0;
  totalKeystrokes = 0;
  wpmSamples = [];
  keystrokeLog = [];
  lastKeystrokeTime = null;
  

  document.getElementById('stat-time').textContent = timeLeft;
  document.getElementById('stat-wpm').textContent = 0;
  document.getElementById('stat-accuracy').textContent = 100;

  document.getElementById('results-panel').hidden = true;
  wordsInput.disabled = false;

  renderWords(20);
  wordsInput.value = '';
  focusInput();
  moveCaret();
}

wordsInput.addEventListener('input', checkTypedWord);

wordsInput.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    e.preventDefault();
    goToNextWord();
  }

  if (e.key === 'Backspace' && wordsInput.value.length === 0) {
    e.preventDefault();
    goToPreviousWord();
  }
});

restartBtn.addEventListener('click', startTest);

document.addEventListener('DOMContentLoaded', startTest);

