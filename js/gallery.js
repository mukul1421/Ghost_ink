function drawIdenticon(canvas, hexKey) {
  const ctx = canvas.getContext('2d');
  const gridSize = 5;
  const cellSize = canvas.width / gridSize;

  const bytes = hexKey.match(/.{2}/g).map(pair => parseInt(pair, 16));

  ctx.fillStyle = '#1b2833';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const hue = Math.round((bytes[0] / 255) * 360);
  ctx.fillStyle = `hsl(${hue}, 65%, 60%)`;

  let byteIndex = 1;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < 3; col++) {
      const filled = bytes[byteIndex] % 2 === 0;
      byteIndex++;

      if (filled) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        ctx.fillRect((gridSize - 1 - col) * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
}

async function renderGallery() {
  const sessions = await getAllSessions();
  const grid = document.getElementById('gallery-grid');

  if (sessions.length === 0) {
    grid.innerHTML = '<p class="empty-state">No sessions yet. Go finish a test.</p>';
    return;
  }

  const sorted = sessions.slice().reverse();

  grid.innerHTML = '';

  sorted.forEach(session => {
    const tile = document.createElement('button');
    tile.classList.add('gallery-tile');

    const canvas = document.createElement('canvas');
    canvas.width = 72;
    canvas.height = 72;

    tile.appendChild(canvas);
    grid.appendChild(tile);

    drawIdenticon(canvas, session.key);

    tile.addEventListener('click', () => showDetail(session));
  });
}

function showDetail(session) {
  const detail = document.getElementById('gallery-detail');

  detail.innerHTML = `
    <div class="signature-card">
      <canvas id="detail-canvas" width="72" height="72"></canvas>
      <div class="signature-info">
        <span class="signature-label">${new Date(session.date).toLocaleString()}</span>
        <code>${session.key}</code>
      </div>
    </div>
    <div class="detail-stats">
      <p>WPM: <span>${session.wpm}</span></p>
      <p>Accuracy: <span>${session.accuracy}%</span></p>
      <p>Consistency: <span>${session.consistency}%</span></p>
    </div>
  `;

  detail.hidden = false;
  drawIdenticon(document.getElementById('detail-canvas'), session.key);
}

document.addEventListener('DOMContentLoaded', renderGallery);