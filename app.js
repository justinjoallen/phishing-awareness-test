document.addEventListener("DOMContentLoaded", () => {
  const quizForm = document.getElementById("quizForm");
  const quizFeedback = document.getElementById("quizFeedback");
  const attestation = document.getElementById("attestation");

  if (quizForm) {
    quizForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const correct = { q1:"yes", q2:"no", q3:"yes", q4:"no", q5:"yes" };
      let score = 0;
      const formData = new FormData(quizForm);

      Object.keys(correct).forEach(q => {
        if (formData.get(q) === correct[q]) score++;
      });

      quizFeedback.textContent = `You scored ${score}/5. ${
        score >= 4 ? "Passing score!" : "Review the lesson and try again."
      }`;

      if (score >= 4) {
        attestation.style.display = "block";
      }
    });
  }
});
