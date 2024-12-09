(function() {
    const style = document.createElement('style');
    style.innerHTML = `
        /* Estilo para a notificação com tema preto */
        .notificacao {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #333; /* Fundo escuro */
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 16px;
            display: none;
            z-index: 1000;
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.5);
            animation: slideIn 0.5s forwards;
            max-width: 300px;
            width: auto;
            line-height: 1.5;
            cursor: pointer; /* Indica que é clicável */
            display: flex;
            align-items: center; /* Alinha o conteúdo */
        }

        /* Animação de entrada (aparecer) */
        @keyframes slideIn {
            from {
                opacity: 0;
                right: -350px;
            }
            to {
                opacity: 1;
                right: 20px;
            }
        }

        /* Animação de desaparecimento (sumir) */
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }

        /* Estilo do ícone (opcional) */
        .notificacao .icone {
            margin-right: 15px;
            font-size: 20px; /* Tamanho do ícone */
        }
    `;
    document.head.appendChild(style);

    function mostrarNotificacao(texto, tipo = 'info') {
        var notificacao = document.createElement('div');
        notificacao.classList.add('notificacao');

        var icone = document.createElement('span');
        icone.classList.add('icone');

        if (tipo === 'sucesso') {
            icone.classList.add('fas', 'fa-check-circle');
        } else if (tipo === 'erro') {
            icone.classList.add('fas', 'fa-times-circle');
        } else if (tipo === 'info') {
            icone.classList.add('fas', 'fa-info-circle');
        } else if (tipo === 'coracao') {
            icone.classList.add('fas', 'fa-heart');
        }

        var textoNotificacao = document.createElement('span');
        textoNotificacao.textContent = texto;
        notificacao.appendChild(icone);
        notificacao.appendChild(textoNotificacao);
        document.body.appendChild(notificacao);
        notificacao.style.display = 'flex';
        notificacao.addEventListener('click', function() {
            notificacao.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(function() {
                notificacao.style.display = 'none';
                document.body.removeChild(notificacao);
            }, 500);
        });

        setTimeout(function() {
            if (notificacao.style.display !== 'none') {
                notificacao.style.animation = 'fadeOut 0.5s forwards';
                setTimeout(function() {
                    notificacao.style.display = 'none';
                    document.body.removeChild(notificacao);
                }, 500);
            }
        }, 7000);
    }

    window.mostrarNotificacao = mostrarNotificacao;
})();
