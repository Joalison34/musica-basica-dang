// ========================
// VERITAS.JS – ADM POWERS CORE
// ========================

(function () {
  const observer = new MutationObserver(() => {
    const mensagens = document.querySelectorAll('.mensagem');

    mensagens.forEach(msg => {
      const dono = msg.dataset.dono === 'true';
      const texto = msg.innerText.trim();

      if (!msg.classList.contains('veritas-feita')) {
        msg.classList.add('veritas-feita');

        // IDEA 1: Shadow Delete
        if (msg.dataset.apagado === 'true' && !dono) {
          msg.innerText = '🚫 Mensagem removida por um ADM';
        }

        // IDEA 4: Mensagem cinematográfica do dono
        if (dono) {
          msg.style.animation = 'epicEntrance 0.5s ease';
          msg.style.background = '#0f0';
          msg.style.color = '#000';
          msg.style.fontWeight = 'bold';
          msg.innerHTML += ' <span style="font-size: 0.7em; opacity: 0.8">(OWNER)</span>';

          setTimeout(() => {
            msg.style.animation = '';
          }, 500);
        }

        // IDEA 5: /explode comando visual
        if (dono && texto.toLowerCase().startsWith('/explode')) {
          fakeExplode();
        }

        // IDEA 2: Fake Message Injection (verificação leve)
        if (msg.dataset.fake === 'true') {
          msg.style.border = '2px dashed red';
          msg.title = 'Mensagem falsa enviada por ADM';
        }

        // IDEA 3: Ban Fantasma (simulação)
        // Não implementado aqui por ética
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // ===============
  // Funções especiais
  // ===============
  function fakeExplode() {
    const body = document.body;
    body.style.transition = 'all 0.3s ease';

    // Tremor
    body.animate([
      { transform: 'translate(0, 0)' },
      { transform: 'translate(-5px, 5px)' },
      { transform: 'translate(5px, -5px)' },
      { transform: 'translate(-5px, -5px)' },
      { transform: 'translate(0, 0)' }
    ], {
      duration: 500,
      iterations: 5
    });

    // Tela bugada
    const tela = document.createElement('div');
    tela.style.position = 'fixed';
    tela.style.top = 0;
    tela.style.left = 0;
    tela.style.width = '100vw';
    tela.style.height = '100vh';
    tela.style.background = '#000';
    tela.style.color = '#0f0';
    tela.style.display = 'flex';
    tela.style.alignItems = 'center';
    tela.style.justifyContent = 'center';
    tela.style.fontSize = '2em';
    tela.style.zIndex = 9999;
    tela.innerText = '🧠 Navegador corrompido. Vazando pro Vasco...';

    document.body.appendChild(tela);

    setTimeout(() => {
      tela.remove();
    }, 4000);
  }

  // ===============
  // Estilos adicionais
  // ===============
  const estilo = document.createElement('style');
  estilo.innerHTML = `
    @keyframes epicEntrance {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(estilo);
})();
      
