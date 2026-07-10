// ============================================================
// Drama Total Wiki — Front-end integrado à API (Back-end NestJS)
// ============================================================
// O front-end não usa mais dados mockados: os personagens são
// buscados dinamicamente na API REST protegida por JWT.

const API_BASE_URL = 'http://localhost:3000/api';

let token = null; // token JWT em memória (não usamos localStorage por padrão de segurança simples)
let usuarioAtual = null;
let personagensCache = [];
let filtroAtual = 'todos';
let editandoId = null;

// ---------- Utilitários de API ----------
async function apiFetch(path, options = {}) {
  const headers = Object.assign(
    { 'Content-Type': 'application/json' },
    options.headers || {},
  );
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const resposta = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let corpo = null;
  const texto = await resposta.text();
  if (texto) {
    try {
      corpo = JSON.parse(texto);
    } catch {
      corpo = texto;
    }
  }

  if (!resposta.ok) {
    const mensagem =
      (corpo && (corpo.message || corpo.error)) ||
      `Erro ${resposta.status} ao chamar a API.`;
    throw new Error(Array.isArray(mensagem) ? mensagem.join(', ') : mensagem);
  }

  return corpo;
}

// ---------- Autenticação ----------
function abrirModalLogin() {
  document.getElementById('modal-login').classList.remove('oculto');
  document.getElementById('login-erro').classList.add('oculto');
}

function fecharModalLogin() {
  document.getElementById('modal-login').classList.add('oculto');
}

function atualizarAreaAuth() {
  const status = document.getElementById('auth-status');
  const btnEntrar = document.getElementById('btn-abrir-login');
  const btnSair = document.getElementById('btn-logout');
  const admin = document.getElementById('admin-personagem');

  if (usuarioAtual) {
    status.textContent = `Olá, ${usuarioAtual.username}`;
    btnEntrar.style.display = 'none';
    btnSair.style.display = 'inline-block';
    admin.classList.remove('oculto');
  } else {
    status.textContent = 'Não autenticado';
    btnEntrar.style.display = 'inline-block';
    btnSair.style.display = 'none';
    admin.classList.add('oculto');
  }
}

async function autenticar(modo) {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const erroEl = document.getElementById('login-erro');
  erroEl.classList.add('oculto');

  try {
    const rota = modo === 'cadastro' ? '/auth/register' : '/auth/login';
    const dados = await apiFetch(rota, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    token = dados.access_token;
    usuarioAtual = dados.user;
    atualizarAreaAuth();
    fecharModalLogin();
    document.getElementById('form-login').reset();
    await carregarPersonagens();
  } catch (err) {
    erroEl.textContent = err.message;
    erroEl.classList.remove('oculto');
  }
}

function sair() {
  token = null;
  usuarioAtual = null;
  personagensCache = [];
  atualizarAreaAuth();
  renderizarPersonagens();
  document.getElementById('personagens-status').textContent =
    'Faça login para carregar os personagens da API.';
  document.getElementById('personagens-status').classList.remove('oculto');
}

// ---------- Personagens (CRUD dinâmico) ----------
async function carregarPersonagens() {
  const statusEl = document.getElementById('personagens-status');
  if (!token) {
    statusEl.textContent = 'Faça login para carregar os personagens da API.';
    statusEl.classList.remove('oculto');
    return;
  }

  statusEl.textContent = 'Carregando personagens…';
  statusEl.classList.remove('oculto');

  try {
    personagensCache = await apiFetch('/personagens');
    statusEl.classList.add('oculto');
    renderizarPersonagens();
  } catch (err) {
    statusEl.textContent = `Erro ao carregar personagens: ${err.message}`;
    statusEl.classList.remove('oculto');
  }
}

function renderizarPersonagens() {
  const grid = document.getElementById('grid-personagens');
  grid.innerHTML = '';

  const lista =
    filtroAtual === 'todos'
      ? personagensCache
      : personagensCache.filter((p) => p.time === filtroAtual);

  lista
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
    .forEach((p) => {
      const article = document.createElement('article');
      article.className = 'card';
      article.dataset.time = p.time;

      article.innerHTML = `
        <div class="card-img"><img src="${p.imagem}" alt="${p.nome}"></div>
        <div class="card-body">
          <h3>${p.nome}</h3>
          <span class="tag-time ${p.time}">${p.time === 'falcao' ? 'Falcão' : 'Gafanhoto'}</span>
          <button class="btn-spoiler">Ver destino</button>
          <div class="spoiler-info">${p.destino}</div>
          ${
            usuarioAtual
              ? `<div class="card-admin-acoes">
                   <button class="btn-editar" data-id="${p.id}">Editar</button>
                   <button class="btn-excluir" data-id="${p.id}">Excluir</button>
                 </div>`
              : ''
          }
        </div>
      `;

      article.querySelector('.btn-spoiler').addEventListener('click', (e) => {
        toggleSpoiler(e.target);
      });

      if (usuarioAtual) {
        article.querySelector('.btn-editar').addEventListener('click', () => {
          iniciarEdicao(p);
        });
        article.querySelector('.btn-excluir').addEventListener('click', () => {
          excluirPersonagem(p.id);
        });
      }

      grid.appendChild(article);
    });
}

function iniciarEdicao(p) {
  editandoId = p.id;
  document.getElementById('admin-titulo').textContent = `Editando: ${p.nome}`;
  document.getElementById('personagem-id').value = p.id;
  document.getElementById('personagem-nome').value = p.nome;
  document.getElementById('personagem-imagem').value = p.imagem;
  document.getElementById('personagem-time').value = p.time;
  document.getElementById('personagem-ordem').value = p.ordem;
  document.getElementById('personagem-destino').value = p.destino;
  document.getElementById('btn-cancelar-edicao').classList.remove('oculto');
  document.getElementById('admin-personagem').scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicao() {
  editandoId = null;
  document.getElementById('admin-titulo').textContent = 'Adicionar personagem';
  document.getElementById('form-personagem').reset();
  document.getElementById('btn-cancelar-edicao').classList.add('oculto');
}

async function salvarPersonagem(e) {
  e.preventDefault();

  const payload = {
    nome: document.getElementById('personagem-nome').value.trim(),
    imagem: document.getElementById('personagem-imagem').value.trim(),
    time: document.getElementById('personagem-time').value,
    destino: document.getElementById('personagem-destino').value.trim(),
  };
  const ordemVal = document.getElementById('personagem-ordem').value;
  if (ordemVal !== '') payload.ordem = Number(ordemVal);

  try {
    if (editandoId) {
      await apiFetch(`/personagens/${editandoId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch('/personagens', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    cancelarEdicao();
    await carregarPersonagens();
  } catch (err) {
    alert(`Erro ao salvar personagem: ${err.message}`);
  }
}

async function excluirPersonagem(id) {
  if (!confirm('Tem certeza que deseja excluir este personagem?')) return;
  try {
    await apiFetch(`/personagens/${id}`, { method: 'DELETE' });
    await carregarPersonagens();
  } catch (err) {
    alert(`Erro ao excluir personagem: ${err.message}`);
  }
}

// ---------- Interações (mantidas do front-end original) ----------
function filtrar(time) {
  filtroAtual = time;
  const botoes = document.querySelectorAll('.btn-filtro');
  botoes.forEach((btn) => btn.classList.remove('ativo'));

  const idBotao = time === 'todos' ? 'btn-todos' : 'btn-' + time;
  document.getElementById(idBotao).classList.add('ativo');

  renderizarPersonagens();
}

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

// ---------- Inicialização ----------
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-abrir-login').addEventListener('click', abrirModalLogin);
  document.getElementById('btn-fechar-modal').addEventListener('click', fecharModalLogin);
  document.getElementById('btn-logout').addEventListener('click', sair);

  document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    autenticar('login');
  });
  document.getElementById('btn-ir-cadastro').addEventListener('click', () => {
    autenticar('cadastro');
  });

  document.getElementById('btn-todos').addEventListener('click', () => filtrar('todos'));
  document.getElementById('btn-falcao').addEventListener('click', () => filtrar('falcao'));
  document.getElementById('btn-gafanhoto').addEventListener('click', () => filtrar('gafanhoto'));

  document.getElementById('form-personagem').addEventListener('submit', salvarPersonagem);
  document.getElementById('btn-cancelar-edicao').addEventListener('click', cancelarEdicao);

  atualizarAreaAuth();
});
