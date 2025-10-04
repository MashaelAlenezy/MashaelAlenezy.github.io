

    // --- Elements ---
    const unitSel = document.getElementById('unit');
    const textSel = document.getElementById('text');
    const wpmRange = document.getElementById('wpm');
    const wpmOut = document.getElementById('wpmOut');
    const ttsToggle = document.getElementById('ttsToggle');
    const voiceSel = document.getElementById('voice');

    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const celebrateBtn = document.getElementById('celebrateBtn');

    const statusPill = document.getElementById('statusPill');
    const wordEl = document.getElementById('word');
    const idxEl = document.getElementById('idx');
    const totalEl = document.getElementById('total');
    const elapsedEl = document.getElementById('elapsed');
    const etaEl = document.getElementById('eta');

    let words = []; let i=0; let timer=null; let startedAt=0; let paused=false; let speechUtterance=null;

    // Populate texts on unit change
    function populateTexts() {
      const unit = unitSel.value; textSel.innerHTML = '<option value="">Choose Text</option>';
      CONTENT[unit].forEach(t => {
        const opt = document.createElement('option'); opt.value = t.id; opt.textContent = t.title; textSel.appendChild(opt);
      });
    }
    unitSel.addEventListener('change', populateTexts);
    populateTexts();

    // WPM live output
    wpmOut.textContent = wpmRange.value;
    wpmRange.addEventListener('input', () => { wpmOut.textContent = wpmRange.value; updateETA(); });

    // TTS toggle
    ttsToggle.addEventListener('change', () => {
      voiceSel.disabled = !ttsToggle.checked;
      if (ttsToggle.checked && 'speechSynthesis' in window) {
        const voices = speechSynthesis.getVoices();
        voiceSel.innerHTML = voices.map(v => `<option>${v.name}</option>`).join('') || '<option>Default</option>';
      }
    });

    // Controls
    startBtn.addEventListener('click', startReading);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetAll);
    celebrateBtn.addEventListener('click', launchConfetti);
    // document.getElementById('refreshBtn').addEventListener('click', resetAll);

    // Keyboard shortcuts
    window.addEventListener('keydown', e => {
      if (e.code === 'Space') { e.preventDefault(); togglePause(); }
      if (e.code === 'ArrowRight') step(1);
      if (e.code === 'ArrowLeft') step(-1);
    });

    function prepareWords() {
      const unit = unitSel.value; const textId = textSel.value || CONTENT[unit][0].id;
      const item = Object.values(CONTENT).flat().find(x => x.id === textId) || CONTENT[unit][0];
      words = item.body.replace(/\s+/g,' ').trim().split(' ');
      i = 0; totalEl.textContent = words.length; idxEl.textContent = 0; wordEl.textContent = 'Ready!'; updateETA();
    }

    function msPerWord(){ return Math.max(50, 60000 / parseInt(wpmRange.value,10)); }

    function startReading(){
    $('html,body').animate({
        scrollTop: $("#flasher").offset().top},
        'slow');
      if (!words.length) prepareWords();
      status('Reading'); startedAt = performance.now(); paused=false; pauseBtn.disabled=false; startBtn.disabled=true;
      runTick();
    }

    function runTick(){
      clearInterval(timer);
      timer = setInterval(() => { if(!paused) step(1); }, msPerWord());
    }

    function speak(word){
      if (!ttsToggle.checked || !('speechSynthesis' in window)) return;
      if (speechUtterance) speechSynthesis.cancel();
      speechUtterance = new SpeechSynthesisUtterance(word);
      const pick = Array.from(speechSynthesis.getVoices()).find(v=> v.name === voiceSel.value);
      if (pick) speechUtterance.voice = pick;
      speechSynthesis.speak(speechUtterance);
    }

    function step(delta){
      if (!words.length) return;
      i = Math.min(Math.max(i + delta, 0), words.length);
      if (i >= words.length){
        finish(); return;
      }
      const w = words[i];
      wordEl.textContent = w; idxEl.textContent = i+1; speak(w); updateElapsed();
    }

    function togglePause(){
      if (!words.length) return;
      paused = !paused; status(paused? 'Paused':'Reading');
      if (!paused) runTick(); else clearInterval(timer);
    }

    function finish(){
      clearInterval(timer); status('Done'); wordEl.textContent = '🎉 Completed!';
      launchConfetti(); startBtn.disabled=false; pauseBtn.disabled=true;
    }

    function resetAll(){
      clearInterval(timer); words=[]; i=0; startedAt=0; paused=false; wordEl.textContent='Ready?';
      elapsedEl.textContent='0.0s'; idxEl.textContent='0'; totalEl.textContent='0'; etaEl.textContent='—';
      status('Ready'); startBtn.disabled=false; pauseBtn.disabled=true; textSel.value=''; populateTexts();
    }

    function status(t){ statusPill.textContent = t; }

    function updateElapsed(){
      if (!startedAt) return; const s = (performance.now() - startedAt)/1000; elapsedEl.textContent = s.toFixed(1)+'s'; updateETA();
    }

    function updateETA(){
      const remaining = (words.length - i) * msPerWord();
      if (!words.length) { etaEl.textContent = '—'; return; }
      etaEl.textContent = (remaining/1000).toFixed(1)+'s';
    }

    const defaults = {
        spread: 360,
        ticks: 100,
        gravity: 0.4,
        decay: 0.94,
        startVelocity: 40,
    };
    // Confetti + emoji confetti
    function launchConfetti() {
  confetti({
    ...defaults,
    particleCount: 100,
    scalar: 1.2,
    shapes: ["circle", "square"],
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
  });

  confetti({
    ...defaults,
    particleCount: 40,
    scalar: 2,
    shapes: ["emoji"],
    shapeOptions: {
      emoji: {
        value: ["🎉", "✨", "🎊", "💫", "🌸", "💖"],
      },
    },
  });
  const end = Date.now() + 800;


//   const el = document.getElementById("celebration");
//   el.style.display = "block";
//   el.textContent = "🎊 Emoji Confetti Party!";
//   setTimeout(() => {
//     el.style.display = "none";
//   }, 3000);
}

    // Initialize
    prepareWords();