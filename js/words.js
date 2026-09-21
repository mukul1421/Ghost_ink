
const WORD_LIST = [
  "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog",
  "code", "type", "signature", "rhythm", "pattern", "unique", "key",
  "learn", "build", "write", "focus", "speed", "accuracy", "test",
  "browser", "script", "function", "array", "object", "value", "event"
];

function getRandomWords(count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
    result.push(WORD_LIST[randomIndex]);
  }
  return result;
}