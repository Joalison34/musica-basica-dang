let isAutomating = false;
let taskData = [];

console.clear();
const noop = () => {};
console.warn = console.error = window.debug = noop;

const splashScreen = document.createElement('div');

class EventEmitter {
  constructor() { this.events = {}; }
  on(t, e) { (Array.isArray(t) ? t : [t]).forEach(t => (this.events[t] = this.events[t] || []).push(e)); }
  off(t, e) { (Array.isArray(t) ? t : [t]).forEach(t => this.events[t] && (this.events[t] = this.events[t].filter(h => h !== e))); }
  emit(t, ...e) { this.events[t]?.forEach(h => h(...e)); }
  once(t, e) { const s = (...i) => { e(...i); this.off(t, s); }; this.on(t, s); }
}

const plppdo = new EventEmitter();

new MutationObserver(mutationsList => 
  mutationsList.some(m => m.type === 'childList') && plppdo.emit('domChanged')
).observe(document.body, { childList: true, subtree: true });

const delay = ms => new Promise(resolve => setTimeout(resolve, Math.random() * 200 + ms));

function sendToast(text, duration = 5000, gravity = 'bottom') {
  Toastify({
    text,
    duration,
    gravity,
    position: "center",
    stopOnFocus: true,
    style: { background: "linear-gradient(to right, #ff0000, #cc0000)" }
  }).showToast();
}

async function showSplashScreen() {
  splashScreen.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom, #ff0000, #330000);display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;transition:opacity 1s ease;user-select:none;color:white;font-family:MuseoSans,sans-serif;font-size:40px;text-align:center;text-shadow:0 0 15px #000;";
  splashScreen.innerHTML = '<span style="color:#fff;">INJETANDO</span><span style="color:#ff4d4d;">SCRIPTS</span><br><small style="font-size:20px;">Criado por Joalison 🔥</small>';
  document.body.appendChild(splashScreen);
  setTimeout(() => splashScreen.style.opacity = '1', 10);
}

async function hideSplashScreen() {
  splashScreen.style.opacity = '0';
  setTimeout(() => splashScreen.remove(), 1000);
}

async function loadScript(url, label) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Falha ao carregar ${label}`);
    const script = await response.text();
    eval(script);
  } catch (e) {
    sendToast(`⚠️｜Erro ao carregar ${label}: ${e.message}`, 5000);
  }
}

async function loadCss(url) {
  return new Promise(resolve => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.onload = resolve;
    link.onerror = () => sendToast(`⚠️｜Erro ao carregar CSS: ${url}`, 5000);
    document.head.appendChild(link);
  });
}

function createAutomationPanel() {
  const panel = document.createElement('div');
  panel.id = 'automation-panel';
  panel.style.cssText = 'position:fixed;top:10px;left:10px;background:#330000;border:2px solid #ff0000;padding:15px;border-radius:8px;z-index:10000;color:white;font-family:MuseoSans,sans-serif;box-shadow:0 0 10px #ff0000;';
  panel.innerHTML = `
    <h3 style="margin:0 0 10px;color:#ff4d4d;">Injetando Scripts 🔥</h3>
    <p id="task-progress" style="margin:5px 0;">Nenhuma tarefa iniciada</p>
    <button id="check-tasks" style="background:#ff0000;color:white;padding:8px 12px;border:none;border-radius:5px;cursor:pointer;margin-right:5px;">Verificar Tarefas</button>
    <button id="start-automation" style="background:#ff0000;color:white;padding:8px 12px;border:none;border-radius:5px;cursor:pointer;" disabled>Iniciar Automação</button>
    <button id="pause-automation" style="background:#666;color:white;padding:8px 12px;border:none;border-radius:5px;cursor:pointer;display:none;">Pausar</button>
    <div id="task-list" style="max-height:300px;overflow-y:auto;margin-top:10px;"></div>
  `;
  document.body.appendChild(panel);

  document.getElementById('check-tasks').addEventListener('click', checkTasks);
  document.getElementById('start-automation').addEventListener('click', startAutomation);
  document.getElementById('pause-automation').addEventListener('click', togglePause);
}

async function checkTasks() {
  taskData = [];
  const tasks = Array.from(document.querySelectorAll('[data-testid="assignment-card"]')).map(task => ({
    link: task.querySelector('a')?.href,
    title: task.querySelector('h3')?.innerText || 'Tarefa sem título',
    topic: task.querySelector('[data-testid="assignment-card-topic"]')?.innerText || 'Tópico não identificado'
  }));

  if (tasks.length === 0) {
    sendToast('⚠️｜Nenhuma tarefa encontrada!', 5000);
    return;
  }

  const topics = [...new Set(tasks.map(t => t.topic))];
  taskData = topics.map(topic => ({
    topic,
    tasks: tasks.filter(t => t.topic === topic)
  }));

  const taskList = document.getElementById('task-list');
  taskList.innerHTML = taskData.map(topic => `
    <div style="margin-bottom:10px;">
      <strong>${topic.topic}</strong>
      <ul style="margin:5px 0;padding-left:20px;">
        ${topic.tasks.map(task => `<li>${task.title}</li>`).join('')}
      </ul>
      <button class="auto-topic" data-topic="${topic.topic}" style="background:#ff4d4d;color:white;padding:5px 10px;border:none;border-radius:3px;cursor:pointer;">Automatizar Tópico</button>
    </div>
  `).join('');

  document.getElementById('start-automation').disabled = false;
  Array.from(document.getElementsByClassName('auto-topic')).forEach(btn => 
    btn.addEventListener('click', () => startAutomation(btn.dataset.topic))
  );

  sendToast('🔥｜Tarefas verificadas! Escolha um tópico ou inicie tudo.', 3000);
}

async function startAutomation(specificTopic = null) {
  if (isAutomating) return;
  isAutomating = true;
  const startButton = document.getElementById('start-automation');
  const pauseButton = document.getElementById('pause-automation');
  startButton.disabled = true;
  pauseButton.style.display = 'inline-block';

  const topicsToProcess = specificTopic ? taskData.filter(t => t.topic === specificTopic) : taskData;

  for (const topic of topicsToProcess) {
    document.getElementById('task-progress').innerText = `Automatizando tópico: ${topic.topic}`;
    const startTime = Date.now();
    for (const task of topic.tasks) {
      if (!isAutomating) break;
      try {
        await processTask(task);
        sendToast(`🔥｜Tarefa "${task.title}" concluída!`, 2000);
      } catch (e) {
        sendToast(`⚠️｜Erro na tarefa "${task.title}": ${e.message}`, 5000);
      }
      await delay(100);
    }
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < 20000) await delay(20000 - elapsedTime); // Garante ~20s por tópico
  }

  if (isAutomating) {
    isAutomating = false;
    document.getElementById('task-progress').innerText = 'Todas as tarefas concluídas!';
    startButton.disabled = false;
    pauseButton.style.display = 'none';
    sendToast('🔥｜Automação finalizada com sucesso!', 5000);
  }
}

function togglePause() {
  isAutomating = !isAutomating;
  const pauseButton = document.getElementById('pause-automation');
  pauseButton.innerText = isAutomating ? 'Pausar' : 'Retomar';
  sendToast(isAutomating ? '🔥｜Automação retomada!' : '⏸️｜Automação pausada.', 2000);
}

async function processTask(task) {
  const response = await fetch(task.link);
  if (!response.ok) throw new Error('Falha ao carregar tarefa');
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const selectors = [
    `[data-testid="choice-icon__library-choice-icon"]`,
    `[data-testid="exercise-check-answer"]`,
    `[data-testid="exercise-next-question"]`,
    `._1udzurba`,
    `._awve9b`
  ];

  for (let i = 0; i < 20; i++) {
    for (const selector of selectors) {
      if (doc.querySelector(selector)) {
        const event = new MouseEvent('click', { bubbles: true });
        doc.querySelector(selector).dispatchEvent(event);
        const element = doc.querySelector(`${selector}> div`);
        if (element?.innerText === "Mostrar resumo") {
          return;
        }
      }
    }
    await delay(100);
  }
}

function setupFetchInterceptor() {
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    let body;
    if (input instanceof Request) {
      body = await input.clone().text();
    } else if (init?.body) {
      body = init.body;
    }

    if (body?.includes('"operationName":"updateUserVideoProgress"')) {
      try {
        let bodyObj = JSON.parse(body);
        if (bodyObj.variables?.input) {
          const durationSeconds = bodyObj.variables.input.durationSeconds;
          bodyObj.variables.input.secondsWatched = durationSeconds;
          bodyObj.variables.input.lastSecondWatched = durationSeconds;
          body = JSON.stringify(bodyObj);
          if (input instanceof Request) {
            input = new Request(input, { body });
          } else {
            init.body = body;
          }
          sendToast("🔥｜Vídeo exploitado.", 1000);
        }
      } catch (e) {}
    }

    const originalResponse = await originalFetch.apply(this, arguments);
    try {
      const clonedResponse = originalResponse.clone();
      const responseBody = await clonedResponse.text();
      let responseObj = JSON.parse(responseBody);

      if (responseObj?.data?.assessmentItem?.item?.itemData) {
        let itemData = JSON.parse(responseObj.data.assessmentItem.item.itemData);
        if (itemData.question.content[0] === itemData.question.content[0].toUpperCase()) {
          itemData.answerArea = {
            calculator: false,
            chi2Table: false,
            periodicTable: false,
            tTable: false,
            zTable: false
          };
          itemData.question.content = "Criado por: Joalison 🔥 " + `[[☃ radio 1]]`;
          itemData.question.widgets = {
            "radio 1": {
              type: "radio",
              options: { choices: [{ content: "🔥", correct: true }] }
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
    } catch (e) {}

    return originalResponse;
  };
}

if (!/^https?:\/\/([a-z0-9-]+\.)?khanacademy\.org/.test(window.location.href)) {
  window.location.href = "https://pt.khanacademy.org/";
} else {
  (async function init() {
    await showSplashScreen();
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js', 'darkReaderPlugin').then(() => {
        DarkReader.setFetchMethod(window.fetch);
        DarkReader.enable({ brightness: 100, contrast: 90, sepia: 10 });
      }),
      loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css'),
      loadScript('https://cdn.jsdelivr.net/npm/toastify-js', 'toastifyPlugin')
    ]);
    await delay(2000);
    await hideSplashScreen();
    createAutomationPanel();
    setupFetchInterceptor();
    sendToast("🔥｜Injetando Scripts por Joalison iniciado!", 5000);
    console.clear();
  })();
                                   }
