/* Интерактивен дисплей на страница „За мен“: сменя Код → Презентация → Данни → Проект → Тест.
   Автоматичната смяна е на всеки 9 s (лентата отдолу), спира при пауза, при посочване с мишката
   и когато дисплеят не се вижда на екрана. */
(function () {
  const board = document.getElementById("smartboard");
  if (!board) return;

  const tabs = [...board.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(t => document.getElementById(t.getAttribute("aria-controls")));
  const bar = document.getElementById("sb-bar");
  const title = document.getElementById("sb-title");
  const pauseBtn = document.getElementById("sb-pause");
  const names = ["Код: първа уеб страница", "Презентация: Мултимедия", "Обработка на данни", "Проект: сайт на класа", "Бърз тест"];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let cur = 0, userPaused = reduced, hover = false, visible = false;

  function restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth; // рестарт на CSS анимациите
    el.classList.add(cls);
  }

  function resetQuiz() {
    board.querySelectorAll(".quiz-opts button").forEach(b => { b.disabled = false; b.className = ""; });
    document.getElementById("sb-quiz-fb").textContent = "Избери отговор 👆";
  }

  function show(i, focus) {
    cur = (i + tabs.length) % tabs.length;
    tabs.forEach((t, k) => {
      const on = k === cur;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
      panels[k].classList.remove("run");
    });
    if (focus) tabs[cur].focus();
    title.textContent = names[cur];
    if (panels[cur].classList.contains("sb-quiz")) resetQuiz();
    if (panels[cur].classList.contains("sb-code")) document.getElementById("sb-hi-msg").textContent = "";
    restart(panels[cur], "run");
    restart(bar, "go");
    sync();
  }

  function sync() {
    const paused = userPaused || hover || !visible;
    board.classList.toggle("is-paused", paused);
    pauseBtn.setAttribute("aria-pressed", userPaused);
    pauseBtn.textContent = userPaused ? "▶" : "❚❚";
    pauseBtn.setAttribute("aria-label", userPaused ? "Пусни автоматичната смяна" : "Пауза на автоматичната смяна");
  }

  bar.addEventListener("animationend", () => show(cur + 1));

  tabs.forEach((t, k) => {
    t.addEventListener("click", () => show(k));
    t.addEventListener("keydown", e => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); show(cur + d, true); }
      else if (e.key === "Home") { e.preventDefault(); show(0, true); }
      else if (e.key === "End") { e.preventDefault(); show(tabs.length - 1, true); }
    });
  });

  pauseBtn.addEventListener("click", () => { userPaused = !userPaused; sync(); });

  if (matchMedia("(hover: hover)").matches) {
    const screen = board.querySelector(".sb-screen");
    screen.addEventListener("mouseenter", () => { hover = true; sync(); });
    screen.addEventListener("mouseleave", () => { hover = false; sync(); });
  }

  // бутонът „Натисни ме“ в резултата
  const praises = ["Браво! 🎉", "Супер! ⭐", "Отличен код! 💯", "Работи! 🚀"];
  let p = 0;
  document.getElementById("sb-hi").addEventListener("click", () => {
    const msg = document.getElementById("sb-hi-msg");
    msg.textContent = praises[p++ % praises.length];
    restart(msg, "pop");
  });

  // тест
  board.querySelectorAll(".quiz-opts button").forEach(b => {
    b.addEventListener("click", () => {
      const ok = b.dataset.ok === "1";
      board.querySelectorAll(".quiz-opts button").forEach(x => {
        x.disabled = true;
        if (x.dataset.ok === "1") x.className = "ok";
      });
      if (!ok) b.className = "bad";
      document.getElementById("sb-quiz-fb").textContent = ok
        ? "Вярно! Тагът <a> създава хипервръзка. 🎉"
        : "Почти! Верният отговор е <a> — хипервръзка. 💡";
    });
  });

  // анимациите тръгват, когато дисплеят се появи на екрана
  if ("IntersectionObserver" in window) {
    let first = true;
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && first) { first = false; show(cur); } else sync();
    }, { threshold: 0.35 }).observe(board);
  } else {
    visible = true;
  }

  show(0);
})();
