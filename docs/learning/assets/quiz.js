// Usage: <div class="quiz" data-answer="2" data-why="explanation"><p>Question</p><button>..</button>...<div class="fb"></div></div>
// Feedback wording follows the language of the enclosing <section lang="...">.
const FEEDBACK = {
  en: { right: 'Correct. ', wrong: 'Not quite, try again.' },
  'pt-BR': { right: 'Correto. ', wrong: 'Quase, tente de novo.' }
};
document.querySelectorAll('.quiz').forEach(q => {
  const answer = Number(q.dataset.answer), btns = [...q.querySelectorAll('button')], fb = q.querySelector('.fb');
  const words = FEEDBACK[(q.closest('[lang]') || document.documentElement).lang] || FEEDBACK.en;
  btns.forEach((b, i) => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('right', 'wrong'));
    const ok = i === answer;
    b.classList.add(ok ? 'right' : 'wrong');
    fb.textContent = ok ? words.right + q.dataset.why : words.wrong;
  }));
});
