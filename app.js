// Shared helpers: accordion, progress, analytics, admin gate

// Initialize accordions on a page
function initAccordions() {
  const acc = document.getElementsByClassName("accordion");
  for (let i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      this.classList.toggle("active");
      const panel = this.nextElementSibling;
      const showing = panel.style.display === "block";
      panel.style.display = showing ? "none" : "block";
      updateLessonProgress();
    });
  }
}

// Lesson progress: count open panels
function updateLessonProgress() {
  const panels = document.querySelectorAll(".panel");
  const openCount = Array.from(panels).filter(p => p.style.display === "block").length;
  const total = panels.length || 1;
  const percent = Math.round((openCount / total) * 100);
  const bar = document.getElementById("progress-bar");
  if (bar) {
    bar.style.width = percent + "%";
    bar.textContent = percent + "%";
  }
  // When lesson panels change, we can also mark lessonViewed
  // (already tracked separately on load)
}

// Sitewide analytics helpers (localStorage)
function incrementLS(key) {
  const value = parseInt(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(value));
  return value;
}
function getLS(key) {
  return parseInt(localStorage.getItem(key) || "0");
}
function setLS(key, value) {
  localStorage.setItem(key, String(value));
}

// Quiz logic initializer
function initQuiz() {
  const quizForm = document.getElementById("quizForm");
  const quizFeedback = document.getElementById("quizFeedback");
  const attestation = document.getElementById("attestation");
  const progressBar = document.getElementById("progress-bar");

  if (!quizForm) return;

  const correct = { q1:"yes", q2:"no", q3:"yes", q4:"no", q5:"yes" };
  let answered = new Set();

  quizForm.addEventListener("change", (e) => {
    const q = e.target.name;
    const fb = document.getElementById("fb" + q.slice(1));
    if (fb) {
      if (e.target.value === correct[q]) {
        fb.textContent = "✅ Correct!";
        fb.style.color = "green";
      } else {
        fb.textContent = "❌ Incorrect. Review the lesson.";
        fb.style.color = "red";
      }
    }
    answered.add(q);
    const progress = Math.round((answered.size / Object.keys(correct).length) * 100);
    if (progressBar) {
      progressBar.style.width = progress + "%";
      progressBar.textContent = progress + "%";
    }
  });

  quizForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let score = 0;
    const formData = new FormData(quizForm);
    Object.keys(correct).forEach(q => { if (formData.get(q) === correct[q]) score++; });
    const percent = Math.round((score / Object.keys(correct).length) * 100);

    // Sitewide analytics: attempts and passes
    incrementLS("quizAttempts");
    if (score >= 4) incrementLS("quizPasses");

    if (quizFeedback) {
      quizFeedback.textContent = `Final Score: ${score}/5 (${percent}%). ${score >= 4 ? "Passing score!" : "Please review the lesson and try again."}`;
    }
    if (attestation && score >= 4) attestation.classList.remove("hidden");
    if (attestation && score >= 4) attestation.style.display = "block";
  });
}

// Phishing page quick check
function initPhishingCheck() {
  const select = document.getElementById("redFlagSelect");
  const btn = document.getElementById("checkBtn");
  const feedback = document.getElementById("feedback");
  if (!select || !btn || !feedback) return;

  btn.addEventListener("click", () => {
    if (select.value === "true") {
      feedback.textContent = "✅ Correct! Unrealistic offers are a major red flag.";
      feedback.style.color = "green";
    } else if (select.value === "") {
      feedback.textContent = "Please choose an option.";
      feedback.style.color = "orange";
    } else {
      feedback.textContent = "❌ Not quite. Think about the pay and effort mismatch.";
      feedback.style.color = "red";
    }
  });
}

// Admin gate
function isAdminLoggedIn() {
  return localStorage.getItem("adminToken") === "miami-admin-logged-in";
}
function requireAdminOrRedirect() {
  if (!isAdminLoggedIn()) {
    // Optionally store the intended page for redirect after login
    localStorage.setItem("postLoginRedirect", window.location.pathname);
    window.location.href = "admin.html";
  }
}
function logoutAdmin() {
  localStorage.removeItem("adminToken");
  window.location.href = "admin.html";
}

// Page-specific bootstrapping
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  // Track sitewide events
  if (path.endsWith("lesson.html")) incrementLS("lessonViews");
  if (path.endsWith("phishing.html")) incrementLS("phishingFails");

  // Init accordions and lesson progress on pages that have them
  initAccordions();

  // Init quiz logic if present
  initQuiz();

  // Init phishing quick check
  initPhishingCheck();

  // Analytics page guard
  if (path.endsWith("analytics.html")) {
    requireAdminOrRedirect();
    // Populate analytics counts
    const ids = ["lessonViews","quizAttempts","quizPasses","phishingFails"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = getLS(id);
    });
  }

  // Admin page logic
  if (path.endsWith("admin.html")) {
    const form = document.getElementById("adminLoginForm");
    const msg = document.getElementById("adminMsg");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = document.getElementById("adminUser").value.trim();
        const pass = document.getElementById("adminPass").value.trim();
        // Simple demo credentials — change as needed
        if (user === "admin" && pass === "redhawks") {
          localStorage.setItem("adminToken", "miami-admin-logged-in");
          const dest = localStorage.getItem("postLoginRedirect") || "analytics.html";
          localStorage.removeItem("postLoginRedirect");
          window.location.href = dest;
        } else {
          msg.textContent = "Invalid credentials.";
          msg.style.color = "red";
        }
      });
    }
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logoutAdmin);
  }
});

