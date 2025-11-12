// app.js
document.addEventListener("DOMContentLoaded", () => {
  const quizForm = document.getElementById("quizForm");
  const quizFeedback = document.getElementById("quizFeedback");
  const attestation = document.getElementById("attestation");

  if (quizForm) {
    quizForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Define correct answers: some are red flags (yes), some are not (no)
      const correct = {
        q1: "yes", // Salary changes mid-description → red flag
        q2: "no",  // Clear hourly rate listed → not a red flag
        q3: "yes", // Off-platform application link → red flag
        q4: "no",  // Verified contact info → not a red flag
        q5: "yes"  // Responsibilities vague → red flag
      };

      let score = 0;
      const formData = new FormData(quizForm);

      // Check each answer
      Object.keys(correct).forEach(q => {
        if (formData.get(q) === correct[q]) {
          score++;
        }
      });

      // Show feedback
      quizFeedback.textContent = `You scored ${score}/5. ${
        score >= 4 ? "Passing score!" : "Review the lesson and try again."
      }`;

      // Reveal attestation + badge if passing
      if (score >= 4) {
        attestation.style.display = "block";
      } else {
        attestation.style.display = "none";
      }
    });
  }
});
