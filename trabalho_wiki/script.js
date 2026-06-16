// === INTERAÇÃO 1: Filtro de times ===
function filtrar(time) {
  const cards = document.querySelectorAll('.card');
  const botoes = document.querySelectorAll('.btn-filtro');

  botoes.forEach(btn => btn.classList.remove('ativo'));

  if (time === 'todos') {
    document.getElementById('btn-todos').classList.add('ativo');
    cards.forEach(card => card.classList.remove('oculto'));
  } else {
    document.getElementById('btn-' + time).classList.add('ativo');
    cards.forEach(card => {
      if (card.dataset.time === time) {
        card.classList.remove('oculto');
      } else {
        card.classList.add('oculto');
      }
    });
  }
}

// === INTERAÇÃO 2: Spoiler — revelar destino do personagem ===
function toggleSpoiler(botao) {
  const spoiler = botao.nextElementSibling;
  const visivel = spoiler.classList.contains('visivel');

  if (visivel) {
    spoiler.classList.remove('visivel');
    botao.textContent = 'Ver destino';
  } else {
    spoiler.classList.add('visivel');
    botao.textContent = 'Esconder';
  }
}
