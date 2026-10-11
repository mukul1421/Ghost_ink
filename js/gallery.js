function drawIdenticon(canvas, hexKey) {
  const ctx = canvas.getContext('2d');
  const gridSize = 5;
  const cellSize = canvas.width / gridSize;

  const bytes = hexKey.match(/.{2}/g).map(pair => parseInt(pair, 16));

  ctx.fillStyle = '#2c2e31';
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

function renderSummary(sessions) {
  const summary = document.getElementById('gallery-summary');
  if (!summary) return;

  if (sessions.length === 0) {
    summary.innerHTML = '';
    return;
  }

  const bestWpm = Math.max(...sessions.map(s => s.wpm));
  const avgAccuracy = Math.round(
    sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length
  );

  summary.innerHTML = `
    <div class="summary-stat">
      <span class="summary-value">${sessions.length}</span>
      <span class="summary-label">sessions</span>
    </div>
    <div class="summary-stat">
      <span class="summary-value">${bestWpm}</span>
      <span class="summary-label">best wpm</span>
    </div>
    <div class="summary-stat">
      <span class="summary-value">${avgAccuracy}%</span>
      <span class="summary-label">avg accuracy</span>
    </div>
  `;
}

async function renderGallery() {
  const sessions = (await getAllSessions()).reverse();
  const grid = document.getElementById('gallery-grid');
  const detail = document.getElementById('gallery-detail');
  const clearBtn = document.getElementById('clear-all-btn');

  renderSummary(sessions);
  grid.innerHTML = '';
  detail.hidden = true;
  clearBtn.hidden = sessions.length === 0;

  if (sessions.length === 0) {
    grid.innerHTML = '<p class="empty-state">No sessions yet. Go finish a test.</p>';
    return;
  }

  sessions.forEach(session => {
    const tile = document.createElement('button');
    tile.classList.add('gallery-tile');
    tile.title = session.label || new Date(session.date).toLocaleString();

    const canvas = document.createElement('canvas');
    canvas.width = 72;
    canvas.height = 72;

    tile.appendChild(canvas);
    grid.appendChild(tile);

    drawIdenticon(canvas, session.key);

    tile.addEventListener('click', () => showDetail(session, tile));
  });
}

function showDetail(session, tileEl) {
  document.querySelectorAll('.gallery-tile').forEach(t => t.classList.remove('selected'));
  tileEl.classList.add('selected');

  const detail = document.getElementById('gallery-detail');

  detail.innerHTML = `
    <div class="signature-card">
      <canvas id="detail-canvas" width="72" height="72"></canvas>
      <div class="signature-info">
        <span class="signature-label" id="detail-date"></span>
        <code id="detail-key"></code>
      </div>
    </div>

    <div class="detail-stats">
      <p>WPM: <span>${session.wpm}</span></p>
      <p>Accuracy: <span>${session.accuracy}%</span></p>
      <p>Consistency: <span>${session.consistency}%</span></p>
    </div>

    <div class="detail-edit">
      <label for="detail-label">label</label>
      <div class="detail-edit-row">
        <input type="text" id="detail-label" maxlength="40" placeholder="name this session">
        <button type="button" id="save-label-btn">save</button>
        <button type="button" id="delete-btn" class="danger">delete</button>
      </div>
      <p class="detail-status" id="detail-status"></p>
    </div>
  `;

  document.getElementById('detail-date').textContent = new Date(session.date).toLocaleString();
  document.getElementById('detail-key').textContent = session.key;
  document.getElementById('detail-label').value = session.label || '';

  detail.hidden = false;
  drawIdenticon(document.getElementById('detail-canvas'), session.key);

  document.getElementById('save-label-btn').addEventListener('click', async () => {
    const label = document.getElementById('detail-label').value.trim();
    await updateSession(session.id, { label });

    session.label = label;
    tileEl.title = label || new Date(session.date).toLocaleString();
    document.getElementById('detail-status').textContent = 'saved';
  });

  document.getElementById('delete-btn').addEventListener('click', async () => {
    if (!confirm('Delete this session? This cannot be undone.')) return;
    await deleteSession(session.id);
    await renderGallery();
  });
}

document.getElementById('clear-all-btn').addEventListener('click', async () => {
  if (!confirm('Delete ALL saved sessions? This cannot be undone.')) return;
  await clearAllSessions();
  await renderGallery();
});

document.addEventListener('DOMContentLoaded', renderGallery);