// app.js
(function(){
  const storeKey = "scamTrainingProgress";
  const initial = { lessonDone:false, quizScore:0, quizPassed:false, simReported:false, simClicked:false, completed:false };

  const state = load() || initial;

  const el = {
    badge: document.getElementById("badge"),
    badgeText: document.getElementById("badgeText"),
    stepLesson: document.getElementById("stepLesson"),
    stepQuiz: document.getElementById("stepQuiz"),
    stepSim: document.getElementById("stepSim"),
    stepComplete: document.getElementById("stepComplete"),
    markLessonDone: document.getElementById("markLessonDone"),
    quizForm: document.getElementById("quizForm"),
    quizFeedback: document.getElementById("quizFeedback"),
    markReported: document.getElementById("markReported"),
    simFeedback: document.getElementById("simFeedback"),
    sections: {
      lesson: document.getElementById("lesson"),
      quiz: document.getElementById("quiz"),
      sim: document.getElementById("sim"),
      complete: document.getElementById("complete")
    }
  };

  init();
  bind();

  function init(){
    // Restore state
    updateBadge();
    markStep(el.stepLesson, state.lessonDone);
    markStep(el.stepQuiz, state.quizPassed);
    markStep(el.stepSim, state.simClicked || state.simReported);
    toggleComplete(state.completed);

    // Show sections based on progress
    show(el.sections.lesson, !state.lessonDone);
    show(el.sections.quiz, state.lessonDone && !state.quizPassed);
    show(el.sections.sim, state.quizPassed && !(state.simClicked || state.simReported));
    show(el.sections.complete, state.completed);
  }

  function bind(){
    if(el.markLessonDone){
      el.markLessonDone.addEventListener("click", ()=>{
        state.lessonDone = true;
        persist();
        el.quizFeedback.textContent = "";
        init();
      });
    }

    if(el.quizForm){
      el.quizForm.addEventListener("submit", (e)=>{
        e.preventDefault();
        const correct = {
          q1:"yes", q2:"yes", q3:"yes", q4:"yes", q5:"yes"
        };
        let score = 0;
        Object.keys(correct).forEach(k=>{
          const val = (new FormData(el.quizForm)).get(k);
          if(val === correct[k]) score++;
        });
        state.quizScore = score;
        state.quizPassed = score >= 4;
        persist();
        el.quizFeedback.textContent = `You scored ${score}/5. ${state.quizPassed ? "Nice work—passing score!" : "Review the lesson and try again."}`;
        init();
      });
    }

    if(el.markReported){
      el.markReported.addEventListener("click", ()=>{
        state.simReported = true;
        el.simFeedback.textContent = "✅ Good instinct: reporting keeps students safe. In real life, flag in Handshake and notify Career Services.";
        persist();
        completeIfReady();
        init();
      });
    }

    // Track simulated click via storage flag when user lands on phishing.html
    document.addEventListener("DOMContentLoaded", ()=>{
      // If on phishing.html, mark a simulated click
      const onPhishingPage = document.title.toLowerCase().includes("phishing");
      if(onPhishingPage){
        const s = load() || initial;
        s.simClicked = true;
        save(s);
      }
    });
  }

  function completeIfReady(){
    if(state.lessonDone && state.quizPassed && (state.simClicked || state.simReported)){
      state.completed = true;
      persist();
    }
  }

  function updateBadge(){
    const active = state.completed;
    el.badge.classList.toggle("badge--active", active);
    el.badge.classList.toggle("badge--inactive", !active);
    el.badgeText.textContent = active ? "Badge: Scam Awareness" : "Badge: In progress";
  }

  function markStep(stepEl, done){
    stepEl.classList.toggle("done", !!done);
  }

  function toggleComplete(showComplete){
    show(el.sections.complete, !!showComplete);
  }

  function show(section, visible){
    if(!section) return;
    section.style.display = visible ? "block" : "none";
  }

  function load(){
    try{
      const raw = localStorage.getItem(storeKey);
      return raw ? JSON.parse(raw) : null;
    }catch(e){ return null; }
  }

  function persist(){ save(state); }

  function save(s){
    try{
      localStorage.setItem(storeKey, JSON.stringify(s));
    }catch(e){}
  }
})();
