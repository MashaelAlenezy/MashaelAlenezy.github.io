const defaults = {
  spread: 150,
  ticks: 50,
  gravity: 1,
  decay: 0.94,
  startVelocity: 40,
};

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
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let activeQuestions = [];
let score = 0;

function showSetupMessage(message, type = "error") {
  let msgBox = document.getElementById("setupMessage");

  if (!msgBox) {
    msgBox = document.createElement("div");
    msgBox.id = "setupMessage";
    msgBox.style.marginTop = "15px";
    msgBox.style.padding = "12px";
    msgBox.style.borderRadius = "12px";
    msgBox.style.textAlign = "center";
    msgBox.style.fontWeight = "bold";

    document
      .getElementById("startBtn")
      .insertAdjacentElement("afterend", msgBox);
  }

  msgBox.textContent = message;
  msgBox.style.display = "block";

  if (type === "error") {
    msgBox.style.background = "#ffe3e3";
    msgBox.style.color = "#b00020";
    msgBox.style.border = "2px solid #ff8a8a";
  } else {
    msgBox.style.background = "#e7f7ff";
    msgBox.style.color = "#006b8f";
    msgBox.style.border = "2px solid #73d2ff";
  }
}

function hideSetupMessage() {
  const msgBox = document.getElementById("setupMessage");
  if (msgBox) {
    msgBox.style.display = "none";
  }
}

document.getElementById("startBtn").onclick = () => {
  const unit = document.getElementById("unitSelect").value;
  const category = document.getElementById("categorySelect").value;

  const unitData = CONTENT[unit];

  if (!unitData) {
    showSetupMessage("Sorry, this unit was not found. Please choose another unit.");
    return;
  }

  let qSet = [];

  if (category === "mixed") {
    const grammar = Array.isArray(unitData.grammar) ? unitData.grammar : [];
    const vocabulary = Array.isArray(unitData.vocabulary) ? unitData.vocabulary : [];

    qSet = [...grammar, ...vocabulary];

    if (qSet.length === 0) {
      showSetupMessage("No questions are available for this unit yet.");
      return;
    }
    
    if (vocabulary.length === 0) {
      const startBtn = document.getElementById("startBtn");
      startBtn.disabled = true;
      let timer = 5;
      showSetupMessage(
          "This unit has grammar questions only, so the quiz will start with grammar in " + timer,
          "info"
        );
      let interval = setInterval(() => {
        timer--;
        showSetupMessage(
          "This unit has grammar questions only, so the quiz will start with grammar in " + timer,
          "info"
        );
        
        if (timer ===0) {
            clearInterval(interval);
          setTimeout(() => { startQuiz(qSet); }, 500);
        }
      }, 1000);
      
      

      return;
    }
  } else {
    qSet = Array.isArray(unitData[category]) ? unitData[category] : [];

    if (qSet.length === 0) {
      showSetupMessage(
        `No ${category} questions are available for this unit. Please choose another category.`
      );
      return;
    }
  }

  startQuiz(qSet);
};

function startQuiz(qSet) {
  hideSetupMessage();

  activeQuestions = shuffle([...qSet]).slice(0, qSet.length);

  document.getElementById("setupSection").style.display = "none";
  document.getElementById("quizSection").style.display = "block";
  document.getElementById("scoreBox").style.display = "none";

  setupQuiz();
}

function renderQuestions() {
  const c = document.getElementById("questionsContainer");
  c.innerHTML = "";

  activeQuestions.forEach((q, i) => {
    const d = document.createElement("div");
    d.className = "question";
    d.dataset.correct = q.correct;

    d.innerHTML = `
      <p><strong>${i + 1}.</strong> ${q.question}</p>
      <div class="answers">
        ${q.options.map(o => `<button class="answer">${o}</button>`).join("")}
      </div>
    `;

    c.appendChild(d);
  });

  document.getElementById("quizTitle").textContent =
    "✨ Choose the best answer for each question:";

  document.getElementById("submitBtn").style.display = "none";
}

function setupQuiz() {
  score = 0;
  renderQuestions();

  const qs = document.querySelectorAll(".question");

  qs.forEach(q => {
    const correct = q.dataset.correct;
    const ans = q.querySelectorAll(".answer");

    ans.forEach(b => {
      b.onclick = () => {
        ans.forEach(x => (x.disabled = true));

        if (b.textContent.trim().startsWith(correct)) {
          b.classList.add("correct");
          score++;
          // launchConfetti();
        } else {
          b.classList.add("wrong");

          const r = [...ans].find(x =>
            x.textContent.trim().startsWith(correct)
          );

          if (r) {
            r.classList.add("correct");
          }
        }

        const total = qs.length;

        const answered = [...document.querySelectorAll(".question")].filter(q =>
          [...q.querySelectorAll(".answer")].some(a => a.disabled)
        ).length;

        if (answered === total) {
          document.getElementById("submitBtn").style.display = "inline-block";
        }
      };
    });
  });
}

document.getElementById("submitBtn").onclick = () => {
  const total = activeQuestions.length;
  const pct = Math.round((score / total) * 100);

  let msg = "Keep practicing! 😅";

  if (pct >= 80) {
    msg = "Excellent work! 🎉";
  } else if (pct >= 60) {
    msg = "Good job! 💪";
  }

  document.getElementById("scoreText").innerHTML = `
    You got <strong>${score}</strong> out of <strong>${total}</strong> correct (${pct}%).<br>
    ${msg}
  `;

  document.getElementById("quizSection").style.display = "none";
  document.getElementById("scoreBox").style.display = "block";

  launchConfetti();
};

document.getElementById("retryBtn").onclick = () => {
  document.getElementById("scoreBox").style.display = "none";
  document.getElementById("setupSection").style.display = "block";
  hideSetupMessage();
};
