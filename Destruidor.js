let loadedPlugins = [];

// Limpa console e desativa logs de erro
console.clear();
const noop = () => {};
console.warn = console.error = window.debug = noop;

// Cria elemento para splash screen
const splashScreen = document.createElement('div');

// Configurações centralizadas
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
    // Anteriormente era vermelho escuro; agora usamos azul escuro
    background: '#00008B', // Azul escuro
    color: '#FFFFFF'       // Texto branco permanece
  },
  splashStyle: `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    /* Fundo em azul escuro, em vez de vermelho escuro */
    background-color: #00002E; 
    display: flex; align-items: center;
    justify-content: center; z-index: 9999; opacity: 0;
    transition: opacity 0.5s ease; user-select: none;
    color: #FFFFFF; font-family: 'Arial', sans-serif;
    font-size: clamp(24px, 5vw, 36px); text-align: center;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  `
};

// Classe para gerenciar eventos
class EventEmitter {
  constructor() { this.events = {}; }
  on(t, e) { 
    (Array.isArray(t) ? t : [t]).forEach(evName => { 
      (this.events[evName] = this.events[evName] || []).push(e); 
    }); 
  }
  off(t, e) { 
    (Array.isArray(t) ? t : [t]).forEach(evName => { 
      this.events[evName] && (this.events[evName] = this.events[evName].filter(h => h !== e)); 
    }); 
  }
  emit(t, ...e) { 
    this.events[t]?.forEach(h => h(...e)); 
  }
  once(t, e) { 
    const s = (...i) => { 
      e(...i); 
      this.off(t, s); 
    }; 
    this.on(t, s); 
  }
}
const emitter = new EventEmitter();

// Observa mudanças no DOM
new MutationObserver(mutationsList => 
  mutationsList.some(m => m.type === 'childList') && emitter.emit('domChanged')
).observe(document.body, { childList: true, subtree: true });

// Funções utilitárias
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
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

// Exibe splash screen
async function showSplashScreen() {
  splashScreen.style.cssText = CONFIG.splashStyle;
  // Mantém "JOALISON" em branco e "DESTRUIDOR DE SISTEMAS" em tom de azul-claro agora
  splashScreen.innerHTML = '<span style="color:#FFFFFF;">JOALISON</span><span style="color:#00BFFF;"> DESTRUIDOR DE SISTEMAS</span>';
  document.body.appendChild(splashScreen);
  await delay(10);
  splashScreen.style.opacity = '1';
}

// Esconde splash screen
async function hideSplashScreen() {
  splashScreen.style.opacity = '0';
  await delay(1000);
  splashScreen.remove();
}

// Carrega script externo de forma segura
async function loadScript(url, label) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Falha ao carregar ${url}`);
    const script = await response.text();
    const scriptEl = document.createElement('script');
    scriptEl.textContent = script;
    document.head.appendChild(scriptEl);
    loadedPlugins.push(label);
  } catch (e) {
    sendToast(`⚠️ Erro ao carregar ${label}: ${e.message}`, 5000);
  }
}

// Carrega CSS externo
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

// Função principal com override de fetch e automações
function setupMain() {
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    let body;
    if (input instanceof Request) {
      body = await input.clone().text();
    } else if (init?.body) {
      body = init.body;
    }

    // Manipula progresso de vídeo (updateUserVideoProgress)
    if (body?.includes('"operationName":"updateUserVideoProgress"')) {
      try {
        let bodyObj = JSON.parse(body);
        if (bodyObj.variables?.input) {
          const durationSeconds = bodyObj.variables.input.durationSeconds;
          bodyObj.variables.input.secondsWatched = durationSeconds;
          bodyObj.variables.input.lastSecondWatched = durationSeconds;
          const newBody = JSON.stringify(bodyObj);
          if (input instanceof Request) {
            input = new Request(input, { 
              method: input.method,
              headers: input.headers,
              body: newBody,
              mode: input.mode,
              credentials: input.credentials,
              cache: input.cache,
              redirect: input.redirect,
              referrer: input.referrer,
              integrity: input.integrity,
              keepalive: input.keepalive,
              signal: input.signal
            });
          } else {
            init.body = newBody;
          }
          sendToast("🔥｜Vídeo dominado!", 1000);
        }
      } catch (e) {
        // silencioso se falhar
      }
    }

    const originalResponse = await originalFetch.apply(this, arguments);

    // Manipula respostas de quizzes
    try {
      const clonedResponse = originalResponse.clone();
      const responseBody = await clonedResponse.text();
      let responseObj = JSON.parse(responseBody);
      
      if (responseObj?.data?.assessmentItem?.item?.itemData) {
        let itemData = JSON.parse(responseObj.data.assessmentItem.item.itemData);
        // Se a primeira parte do conteúdo for maiúscula (condição original)
        if (
          Array.isArray(itemData.question.content) &&
          typeof itemData.question.content[0] === 'string' &&
          itemData.question.content[0] === itemData.question.content[0].toUpperCase()
        ) {
          itemData.answerArea = {
            calculator: false,
            chi2Table: false,
            periodicTable: false,
            tTable: false,
            zTable: false
          };
          itemData.question.content = "Criado por Joalison 🔥 [[☃ radio 1]]";
          itemData.question.widgets = {
            "radio 1": {
              type: "radio",
              options: {
                choices: [{ content: "🔥", correct: true }]
              }
            }
          };
          responseObj.data.assessmentItem.item.itemData = JSON.stringify(itemData);
          return new Response(JSON.stringify(responseObj), {
            status: originalResponse.status,
            statusText: originalResponse.statusText,
            headers: originalResponse.headers
          });
        }
      }
    } catch (e) {
      // silencioso se falhar
    }

    return originalResponse;
  };

  // Loop de automação: clica nos seletores configurados
  (async () => {
    window.joalisonDominates = true;
    while (window.joalisonDominates) {
      for (const selector of CONFIG.selectors) {
        findAndClickBySelector(selector);
        const element = document.querySelector(`${selector} > div`);
        if (element?.innerText === "Mostrar resumo") {
          sendToast("🔥｜Exercício destruído!", CONFIG.toastDuration);
        }
      }
      await delay(CONFIG.clickDelay);
    }
  })();
}

// Inicialização imediata
(async function init() {
  // Se não estiver em khanacademy, redireciona
  if (!/^https?:\/\/([a-z0-9-]+\.)?khanacademy\.org/.test(window.location.href)) {
    window.location.href = "https://pt.khanacademy.org/";
    return;
  }

  await showSplashScreen();
  // Carrega DarkReader e ativa, mas sem alterar lógica
  await loadScript('https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js', 'darkReaderPlugin')
    .then(() => {
      if (window.DarkReader) {
        DarkReader.setFetchMethod(window.fetch);
        DarkReader.enable();
      }
    });
  // Carrega CSS e script do Toastify
  await loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css');
  await loadScript('https://cdn.jsdelivr.net/npm/toastify-js', 'toastifyPlugin');
  // Aguarda duração do splash e esconde
  await delay(CONFIG.splashDuration);
  await hideSplashScreen();
  // Inicia lógica principal
  setupMain();
  sendToast("🔥｜Joalison Destruidor de Sistemas iniciado!");
  console.clear();
})();
    
