// Grab the container where words will be injected
const wordsContainer = document.getElementById('words');

function renderWords(wordCount) {

  wordsContainer.innerHTML = '';

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


renderWords(20);