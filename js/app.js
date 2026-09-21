const wordsInput = document.getElementById('wordsInput');
const wordsContainer = document.getElementById('words');
const wordsWrapper = document.getElementById('wordsWrapper');
const caret = document.getElementById('caret');
const restartBtn = document.getElementById('restart-btn');

let currentWordIndex = 0;
let typedWords = []; // stores what was typed for each word, by index

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
  const currentWordEl = getCurrentWordEl();
  const letterEls = currentWordEl.querySelectorAll('.char');

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

  typedWords[currentWordIndex] = typed; // remember what was typed here
  getCurrentWordEl().classList.add('completed');
  currentWordIndex++;
  wordsInput.value = '';

  moveCaret();
}

function goToPreviousWord() {
  if (currentWordIndex === 0) return; // nothing before the first word

  currentWordIndex--;
  getCurrentWordEl().classList.remove('completed');

  // restore whatever was typed in that word before
  wordsInput.value = typedWords[currentWordIndex] || '';

  checkTypedWord(); // re-color the letters based on restored text
}

function focusInput() {
  wordsInput.focus();
}

function startTest() {
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