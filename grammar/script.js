
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
  const end = Date.now() + 800;

}



function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
let activeQuestions=[],score=0;

document.getElementById("startBtn").onclick=()=>{
  const unit=document.getElementById("unitSelect").value;
  const category=document.getElementById("categorySelect").value;
  let qSet=[];
  if(category==="mixed") qSet=[...CONTENT[unit].grammar,...CONTENT[unit].vocabulary];
  else qSet=[...CONTENT[unit][category]];
  activeQuestions=shuffle(qSet).slice(0,Math.min(10,qSet.length));
  document.getElementById("setupSection").style.display="none";
  document.getElementById("quizSection").style.display="block";
  setupQuiz();
};

function renderQuestions(){
  const c=document.getElementById("questionsContainer");c.innerHTML="";
  activeQuestions.forEach((q,i)=>{
    const d=document.createElement("div");d.className="question";d.dataset.correct=q.correct;
    d.innerHTML=`<p><strong>${i+1}.</strong> ${q.question}</p>
    <div class="answers">${q.options.map(o=>`<button class='answer'>${o}</button>`).join("")}</div>`;
    c.appendChild(d);
  });
  document.getElementById("quizTitle").textContent="✨ Choose the best answer for each question:";
  document.getElementById("submitBtn").style.display="none";
}

function setupQuiz(){
  score=0;renderQuestions();
  const qs=document.querySelectorAll(".question");
  qs.forEach(q=>{
    const correct=q.dataset.correct;
    const ans=q.querySelectorAll(".answer");
    ans.forEach(b=>{
      b.onclick=()=>{
        ans.forEach(x=>x.disabled=true);
        if(b.textContent.trim().startsWith(correct)){
          b.classList.add("correct");score++;
        //   launchConfetti();
        }else{
          b.classList.add("wrong");
          const r=[...ans].find(x=>x.textContent.trim().startsWith(correct));
          if(r)r.classList.add("correct");
        }
        const total=qs.length;
        const answered=[...document.querySelectorAll(".answer")].filter(x=>x.disabled).length/4;
        if(answered===total)document.getElementById("submitBtn").style.display="inline-block";
      };
    });
  });
}

document.getElementById("submitBtn").onclick=()=>{
  const total=activeQuestions.length;
  const pct=Math.round((score/total)*100);
  let msg="Keep practicing! 😅";
  if(pct>=80)msg="Excellent work! 🎉";else if(pct>=60)msg="Good job! 💪";
  document.getElementById("scoreText").innerHTML=`You got <strong>${score}</strong> out of <strong>${total}</strong> correct (${pct}%).<br>${msg}`;
  document.getElementById("quizSection").style.display="none";
  document.getElementById("scoreBox").style.display="block";
  launchConfetti();
};

document.getElementById("retryBtn").onclick=()=>{
  document.getElementById("scoreBox").style.display="none";
  document.getElementById("setupSection").style.display="block";
};