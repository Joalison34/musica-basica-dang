let loadedPlugins = [];

console.clear();
const noop = () => {};
console.warn = console.error = window.debug = noop;

const splashScreen = document.createElement('div');

const CONFIG = {
  splashDuration: 2000,
  clickDelay: 1500,
  toastDuration: 3000,
  selectors: [
    '[data-testid="choice-icon__library-choice-icon"]',
    '[data-testid="exercise-check-answer"]',
    '[data-testid="exercise-next-question"]',
    '._1udzurba',
    '._awve9b'
  ],
  toastStyle: {
    background: '#FF0000',
    color: '#FFFFFF'
  },
  splashStyle: `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: #2E0000;
    display: flex; align-items: center;
    justify-content: center; z-index: 9999; opacity: 0;
    transition: opacity 0.5s ease; user-select: none;
    color: #FFFFFF; font-family: 'Arial', sans-serif;
    font-size: clamp(24px, 5vw, 36px); text-align: center;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  `
};

class EventEmitter {
  constructor() { this.events = {}; }
  on(t, e) {
    (Array.isArray(t) ? t : [t]).forEach(ev => {
      (this.events[ev] = this.events[ev] || []).push(e);
    });
  }
  off(t, e) {
    (Array.isArray(t) ? t : [t]).forEach(ev => {
      this.events[ev] = (this.events[ev] || []).filter(fn => fn !== e);
    });
  }
  emit(t, ...e) {
    (this.events[t] || []).forEach(fn => fn(...e));
  }
  once(t, e) {
    const wrapper = (...args) => {
      e(...args);
      this.off(t, wrapper);
    };
    this.on(t, wrapper);
  }
}
const emitter = new EventEmitter();

new MutationObserver(muts =>
  muts.some(m => m.type === 'childList') && emitter.emit('domChanged')
).observe(document.body, { childList: true, subtree: true });

const delay = ms => new Promise(r => setTimeout(r, ms));
const findAndClickBySelector = selector => document.querySelector(selector)?.click();

function sendToast(text, duration = CONFIG.toastDuration, gravity = 'bottom') {
  if (window.Toastify) {
    Toastify({
      text,
      duration,
      gravity,
      position: 'center',
      stopOnFocus: true,
      style: CONFIG.toastStyle
    }).showToast();
  }
}

async function showSplashScreen() {
  splashScreen.style.cssText = CONFIG.splashStyle;
  splashScreen.innerHTML = '<span style="color:#FFFFFF;">JOALISON</span><span style="color:#FF0000;"> DESTRUIDOR DE SISTEMAS</span>';
  document.body.appendChild(splashScreen);
  await delay(10);
  splashScreen.style.opacity = '1';
}

async function hideSplashScreen() {
  splashScreen.style.opacity = '0';
  await delay(1000);
  splashScreen.remove();
}

async function loadScript(url, label) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Erro ${r.status}`);
    const s = await r.text();
    const el = document.createElement('script');
    el.textContent = s;
    document.head.appendChild(el);
    loadedPlugins.push(label);
  } catch (e) {
    sendToast(`⚠️ Falha ao carregar ${label}: ${e.message}`, 5000);
  }
}

async function loadCss(url) {
  return new Promise(resolve => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.onload = resolve;
    document.head.appendChild(link);
  });
}

function setupMain() {
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    let method = init?.method || 'GET';
    let url = typeof input === 'string' ? input : input.url;
    let body = init?.body || (input instanceof Request ? await input.clone().text() : null);

    // Intercepta vídeos
    if (body?.includes('"operationName":"updateUserVideoProgress"')) {
      try {
        const data = JSON.parse(body);
        if (data?.variables?.input?.durationSeconds) {
          const dur = data.variables.input.durationSeconds;
          data.variables.input.secondsWatched = dur;
          data.variables.input.lastSecondWatched = dur;
          const newBody = JSON.stringify(data);
          if (input instanceof Request) {
            input = new Request(input.url, { ...input, body: newBody });
          } else {
            init.body = newBody;
          }
          sendToast("🔥｜Vídeo dominado!", 1000);
        }
      } catch {}
    }

    const response = await originalFetch.apply(this, arguments);

    // Intercepta quizzes
    try {
      const clone = response.clone();
      const text = await clone.text();
      const json = JSON.parse(text);
      const itemDataStr = json?.data?.assessmentItem?.item?.itemData;
      if (itemDataStr) {
        const itemData = JSON.parse(itemDataStr);
        const widgets = itemData.question?.widgets || {};
        const correctChoice = Object.entries(widgets).find(([_, w]) =>
          w.options?.choices?.some(c => c.correct)
        );

        if (correctChoice) {
          const key = correctChoice[0];
          itemData.question.content = `Criado por Joalison 🔥 [[☃ ${key}]]`;
          for (const [i, choice] of itemData.question.widgets[key].options.choices.entries()) {
            itemData.question.widgets[key].options.choices[i].content =
              choice.correct ? "🔥 Resposta Certa" : "✖️ Errado";
          }
          json.data.assessmentItem.item.itemData = JSON.stringify(itemData);
          return new Response(JSON.stringify(json), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        }
      }
    } catch {}

    return response;
  };

  // Loop automático de clique
  (async () => {
    window.joalisonDominates = true;
    while (window.joalisonDominates) {
      for (const selector of CONFIG.selectors) {
        findAndClickBySelector(selector);
        const el = document.querySelector(`${selector} > div`);
        if (el?.innerText === "Mostrar resumo") {
          sendToast("🔥｜Exercício destruído!", CONFIG.toastDuration);
        }
      }
      await delay(CONFIG.clickDelay);
    }
  })();
}

(async function init() {
  if (!/^https?:\/\/([a-z0-9-]+\.)?khanacademy\.org/.test(location.href)) {
    location.href = "https://pt.khanacademy.org/";
    return;
  }

  await showSplashScreen();
  await loadScript('https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js', 'DarkReader');
  if (window.DarkReader) {
    DarkReader.setFetchMethod(window.fetch);
    DarkReader.enable();
  }
  await loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css');
  await loadScript('https://cdn.jsdelivr.net/npm/toastify-js', 'Toastify');
  await delay(CONFIG.splashDuration);
  await hideSplashScreen();
  setupMain();
  sendToast("🔥｜Joalison Destruidor de Sistemas iniciado!");
  console.clear();
})();
