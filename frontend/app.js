const API = 'http://localhost:8080'; // RESTHeart
const DEEZER = '/deezer'; // proxy do nginx, o Deezer bloqueia CORS

const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Basic ' + btoa('admin:secret')
};

const COL_MUSICA = 'musica';
const COL_ARTISTA = 'artista';

const CORES_GRAFICOS = ['#2a78d6', '#e0812d', '#2f9e6b', '#c2477a', '#7a5bd1', '#b5a22c', '#3aa7b8', '#8a6a4f'];

let musicas = [];
let graficos = {};
let jogo = null;
let edicao = null; // documento sendo editado no formulário

// ---------- Requisições ----------

class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

async function requisicao(url, opcoes = {}) {
  const res = await fetch(url, { headers: HEADERS, ...opcoes });
  if (!res.ok) {
    let detalhe = '';
    try { detalhe = (await res.json()).message || ''; } catch {}
    throw new ErroHttp(res.status, `HTTP ${res.status}${detalhe ? ' - ' + detalhe : ''}`);
  }
  return res;
}

async function deezer(caminho) {
  const res = await fetch(DEEZER + caminho);
  if (!res.ok) throw new ErroHttp(res.status, `Deezer respondeu HTTP ${res.status}`);
  const corpo = await res.json();
  if (corpo.error) throw new Error(`Deezer: ${corpo.error.message || 'erro desconhecido'}`);
  return corpo;
}

// Músicas importadas usam o id do Deezer (número) como _id, e o RESTHeart
// precisa do ?id_type=NUMBER pra achar. As manuais usam ObjectId.
function urlDocumento(colecao, id) {
  if (typeof id === 'number') return `${API}/${colecao}/${id}?id_type=NUMBER`;
  return `${API}/${colecao}/${id.$oid ?? id}`;
}

function chave(doc) {
  return String(doc._id.$oid ?? doc._id);
}

function porChave(c) {
  return musicas.find(m => chave(m) === c);
}

async function garantirColecoes() {
  for (const colecao of [COL_MUSICA, COL_ARTISTA]) {
    const res = await fetch(`${API}/${colecao}?pagesize=1`, { headers: HEADERS });
    if (res.status === 404) {
      await requisicao(`${API}/${colecao}`, { method: 'PUT' });
    } else if (!res.ok) {
      throw new ErroHttp(res.status, `HTTP ${res.status} ao acessar a coleção ${colecao}`);
    }
  }
}

async function listarMusicas() {
  const pagesize = 1000;
  const todas = [];
  for (let page = 1; ; page++) {
    const res = await requisicao(`${API}/${COL_MUSICA}?pagesize=${pagesize}&page=${page}`);
    const docs = await res.json();
    todas.push(...docs);
    if (docs.length < pagesize) break;
  }
  return todas;
}

async function buscarMusica(id) {
  const res = await requisicao(urlDocumento(COL_MUSICA, id));
  return res.json();
}

// 409 = já existe um documento com esse _id
async function inserir(colecao, doc) {
  const res = await fetch(`${API}/${colecao}`, {
    method: 'POST', headers: HEADERS, body: JSON.stringify(doc)
  });
  if (res.status !== 201 && res.status !== 409) {
    throw new ErroHttp(res.status, `HTTP ${res.status} ao gravar em ${colecao}`);
  }
  return res.status;
}

async function substituirMusica(id, doc) {
  await requisicao(urlDocumento(COL_MUSICA, id), { method: 'PUT', body: JSON.stringify(doc) });
}

async function alterarMusica(id, alteracoes) {
  await requisicao(urlDocumento(COL_MUSICA, id), { method: 'PATCH', body: JSON.stringify(alteracoes) });
}

async function excluirMusica(id) {
  await requisicao(urlDocumento(COL_MUSICA, id), { method: 'DELETE' });
}

// ---------- Importação ----------

function documentoDaFaixa(faixa, genero) {
  return {
    _id: faixa.id,
    titulo: faixa.title,
    artista: {
      id_artista: faixa.artist.id,
      nome_artista: faixa.artist.name
    },
    duracao: faixa.duration,
    adicionado_manualmente: false,
    url_capa: faixa.album?.cover_medium || null,
    genero,
    vitorias: 0,
    criado_em: new Date().toISOString()
  };
}

function documentoDoArtista(artista) {
  return {
    _id: artista.id,
    nome: artista.name,
    url_foto: artista.picture_medium || null
  };
}

async function importar(idGenero, nomeGenero) {
  const { data: faixas } = await deezer(`/chart/${idGenero}/tracks?limit=100`);
  let novas = 0, existentes = 0;
  const artistasGravados = new Set();

  for (let i = 0; i < faixas.length; i++) {
    const faixa = faixas[i];
    mostrarMensagem(`Importando ${i + 1} de ${faixas.length}...`, 'carregando');

    if (!artistasGravados.has(faixa.artist.id)) {
      await inserir(COL_ARTISTA, documentoDoArtista(faixa.artist));
      artistasGravados.add(faixa.artist.id);
    }

    const status = await inserir(COL_MUSICA, documentoDaFaixa(faixa, nomeGenero));
    if (status === 201) novas++; else existentes++;
  }
  return { novas, existentes };
}

async function carregarGenerosDeezer() {
  const select = document.getElementById('importar-genero');
  try {
    const { data } = await deezer('/genre');
    select.replaceChildren(new Option('Escolha um gênero', ''));
    data
      .filter(g => g.id !== 0) // 0 = "Todos", não é um gênero
      .forEach(g => select.add(new Option(g.name, g.id)));
  } catch (erro) {
    select.replaceChildren(new Option('Não foi possível carregar os gêneros', ''));
    mostrarMensagem(`Erro ao carregar gêneros do Deezer: ${erro.message}`, 'erro');
  }
}

// ---------- Mensagens e utilidades ----------

let temporizadorMensagem;

function mostrarMensagem(texto, tipo) {
  const el = document.getElementById('mensagem');
  el.textContent = texto;
  el.className = `mensagem ${tipo}`;
  el.hidden = false;
  clearTimeout(temporizadorMensagem);
  if (tipo === 'sucesso') {
    temporizadorMensagem = setTimeout(() => { el.hidden = true; }, 4000);
  }
}

// Mostra "carregando" enquanto a operação roda, depois sucesso ou erro
async function executar(carregando, sucesso, operacao) {
  mostrarMensagem(carregando, 'carregando');
  try {
    const resultado = await operacao();
    const texto = typeof sucesso === 'function' ? sucesso(resultado) : sucesso;
    if (texto) mostrarMensagem(texto, 'sucesso');
    else document.getElementById('mensagem').hidden = true;
    return resultado;
  } catch (erro) {
    console.error(erro);
    const texto = erro instanceof ErroHttp
      ? erro.message
      : `${erro.message} (o banco está rodando? confira com docker compose ps)`;
    mostrarMensagem(`Erro: ${texto}`, 'erro');
  }
}

function formatarDuracao(segundos) {
  const s = Math.round(segundos || 0);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// sem acentos e minúsculo, pra busca
function normalizar(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function embaralhar(lista) {
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

function el(tag, propriedades = {}, filhos = []) {
  const elemento = document.createElement(tag);
  Object.assign(elemento, propriedades);
  elemento.append(...filhos);
  return elemento;
}

function generosExistentes() {
  return [...new Set(musicas.map(m => m.genero).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function preencherSelect(select, valores) {
  const atual = select.value;
  const primeira = select.options[0];
  select.replaceChildren(primeira, ...valores.map(v => new Option(v, v)));
  select.value = valores.includes(atual) ? atual : '';
}

// Chamado depois de qualquer POST, PUT, PATCH ou DELETE
async function recarregar() {
  musicas = await listarMusicas();
  const generos = generosExistentes();
  preencherSelect(document.getElementById('filtro-genero'), generos);
  preencherSelect(document.getElementById('jogo-genero'), generos);
  document.getElementById('lista-generos').replaceChildren(...generos.map(g => el('option', { value: g })));
  renderizarLista();
  renderizarPainel();
}

// ---------- Listagem ----------

function musicasFiltradas() {
  const busca = normalizar(document.getElementById('busca').value.trim());
  const genero = document.getElementById('filtro-genero').value;
  const origem = document.getElementById('filtro-origem').value;

  return musicas.filter(m => {
    if (busca && !normalizar(`${m.titulo} ${m.artista?.nome_artista}`).includes(busca)) return false;
    if (genero && m.genero !== genero) return false;
    if (origem === 'manual' && !m.adicionado_manualmente) return false;
    if (origem === 'importada' && m.adicionado_manualmente) return false;
    return true;
  });
}

function itemDaLista(m) {
  const vitorias = m.vitorias ?? 0;
  const detalhes = [
    m.genero,
    formatarDuracao(m.duracao),
    `${vitorias} vitória${vitorias === 1 ? '' : 's'}`,
    m.adicionado_manualmente ? 'Manual' : 'Deezer'
  ].filter(Boolean).join(' · ');

  const li = el('li', { className: 'musica' }, [
    m.url_capa ? el('img', { className: 'capa', src: m.url_capa, alt: '', loading: 'lazy' }) : '',
    el('div', { className: 'musica-info' }, [
      el('strong', { className: 'musica-titulo', textContent: m.titulo }),
      el('span', { className: 'musica-artista', textContent: m.artista?.nome_artista ?? '' }),
      el('span', { className: 'musica-detalhes', textContent: detalhes })
    ]),
    el('div', { className: 'musica-acoes' }, [
      el('button', { type: 'button', className: 'botao-editar', textContent: 'Editar' }),
      el('button', { type: 'button', className: 'botao-zerar', textContent: 'Zerar vitórias' }),
      el('button', { type: 'button', className: 'botao-excluir', textContent: 'Excluir' })
    ])
  ]);
  li.dataset.chave = chave(m);
  return li;
}

function renderizarLista() {
  const lista = musicasFiltradas();
  document.getElementById('contagem').textContent = `${lista.length} de ${musicas.length} música(s)`;

  const ul = document.getElementById('lista-musicas');
  if (lista.length) {
    ul.replaceChildren(...lista.map(itemDaLista));
  } else {
    const vazio = musicas.length
      ? 'Nenhuma música encontrada com esses filtros.'
      : 'Nenhuma música no banco. Importe do Deezer ou adicione pelo formulário.';
    ul.replaceChildren(el('li', { className: 'vazio', textContent: vazio }));
  }
}

async function aoClicarNaLista(evento) {
  const botao = evento.target.closest('button');
  if (!botao) return;
  const musica = porChave(botao.closest('li').dataset.chave);
  if (!musica) return;

  if (botao.classList.contains('botao-editar')) {
    await abrirEdicao(musica._id);
  } else if (botao.classList.contains('botao-zerar')) {
    await executar('Zerando vitórias...', `Vitórias de "${musica.titulo}" zeradas.`, async () => {
      await alterarMusica(musica._id, { vitorias: 0, atualizado_em: new Date().toISOString() });
      await recarregar();
    });
  } else if (botao.classList.contains('botao-excluir')) {
    if (!confirm(`Excluir "${musica.titulo}"?`)) return;
    await executar('Excluindo...', `"${musica.titulo}" excluída.`, async () => {
      await excluirMusica(musica._id);
      if (edicao && chave(edicao) === chave(musica)) sairDaEdicao();
      await recarregar();
    });
  }
}

// ---------- Formulário ----------

function lerFormulario() {
  const dados = Object.fromEntries(new FormData(document.getElementById('form-musica')));
  return {
    titulo: dados.titulo.trim(),
    nome_artista: dados.nome_artista.trim(),
    genero: dados.genero.trim(),
    duracao: dados.duracao.trim(),
    url_capa: dados.url_capa.trim()
  };
}

function validar(dados) {
  const erros = [];
  if (!dados.titulo) erros.push('Informe o título.');
  if (!dados.nome_artista) erros.push('Informe o artista.');
  if (!dados.genero) erros.push('Informe o gênero.');

  const duracao = Number(dados.duracao);
  if (!dados.duracao) erros.push('Informe a duração.');
  else if (!Number.isInteger(duracao) || duracao < 1 || duracao > 3600) {
    erros.push('A duração deve ser um número inteiro de segundos entre 1 e 3600.');
  }

  if (dados.url_capa) {
    try {
      const url = new URL(dados.url_capa);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    } catch {
      erros.push('A URL da capa deve começar com http:// ou https://.');
    }
  }
  return erros;
}

async function aoEnviarFormulario(evento) {
  evento.preventDefault();
  const dados = lerFormulario();
  const erros = validar(dados);
  document.getElementById('form-erros').replaceChildren(...erros.map(e => el('li', { textContent: e })));
  if (erros.length) {
    mostrarMensagem('Corrija os campos do formulário.', 'erro');
    return;
  }

  const agora = new Date().toISOString();

  if (edicao) {
    // PUT substitui o documento todo, então mantém os campos que o formulário não mostra
    const { _id, _etag, ...resto } = edicao;
    const doc = {
      ...resto,
      titulo: dados.titulo,
      artista: { ...resto.artista, nome_artista: dados.nome_artista },
      genero: dados.genero,
      duracao: Number(dados.duracao),
      url_capa: dados.url_capa || null,
      atualizado_em: agora
    };
    await executar('Salvando...', `"${doc.titulo}" atualizada.`, async () => {
      await substituirMusica(_id, doc);
      sairDaEdicao();
      await recarregar();
    });
  } else {
    const doc = {
      titulo: dados.titulo,
      artista: { id_artista: null, nome_artista: dados.nome_artista },
      duracao: Number(dados.duracao),
      adicionado_manualmente: true,
      url_capa: dados.url_capa || null,
      genero: dados.genero,
      vitorias: 0,
      criado_em: agora
    };
    await executar('Adicionando...', `"${doc.titulo}" adicionada.`, async () => {
      await inserir(COL_MUSICA, doc);
      document.getElementById('form-musica').reset();
      await recarregar();
    });
  }
}

async function abrirEdicao(id) {
  const doc = await executar('Carregando música...', null, () => buscarMusica(id));
  if (!doc) return;

  edicao = doc;
  const form = document.getElementById('form-musica');
  form.titulo.value = doc.titulo ?? '';
  form.nome_artista.value = doc.artista?.nome_artista ?? '';
  form.genero.value = doc.genero ?? '';
  form.duracao.value = doc.duracao ?? '';
  form.url_capa.value = doc.url_capa ?? '';
  document.getElementById('form-erros').replaceChildren();
  document.getElementById('form-titulo').textContent = `Editar "${doc.titulo}"`;
  document.getElementById('form-enviar').textContent = 'Salvar alterações';
  document.getElementById('form-cancelar').hidden = false;
  form.scrollIntoView({ behavior: 'smooth' });
}

function sairDaEdicao() {
  edicao = null;
  document.getElementById('form-musica').reset();
  document.getElementById('form-erros').replaceChildren();
  document.getElementById('form-titulo').textContent = 'Adicionar música';
  document.getElementById('form-enviar').textContent = 'Adicionar';
  document.getElementById('form-cancelar').hidden = true;
}

// ---------- Painel ----------

function calcularIndicadores(lista) {
  const total = lista.length;
  const somaDuracao = lista.reduce((s, m) => s + (m.duracao || 0), 0);
  const manuais = lista.filter(m => m.adicionado_manualmente).length;
  const totalVitorias = lista.reduce((s, m) => s + (m.vitorias || 0), 0);
  const maxVitorias = lista.reduce((max, m) => Math.max(max, m.vitorias || 0), 0);

  const ranking = lista
    .filter(m => (m.vitorias || 0) > 0)
    .sort((a, b) => b.vitorias - a.vitorias || a.titulo.localeCompare(b.titulo))
    .slice(0, 10);

  const porGenero = {};
  for (const m of lista) {
    const g = m.genero || 'Sem gênero';
    porGenero[g] ??= { musicas: 0, vitorias: 0, duracao: 0 };
    porGenero[g].musicas++;
    porGenero[g].vitorias += m.vitorias || 0;
    porGenero[g].duracao += m.duracao || 0;
  }

  return {
    total,
    duracaoMedia: total ? somaDuracao / total : 0,
    percentualManuais: total ? (manuais / total) * 100 : 0,
    totalVitorias,
    maxVitorias,
    ranking,
    porGenero
  };
}

function renderizarPainel() {
  const ind = calcularIndicadores(musicas);

  const cartoes = [
    ['Músicas no banco', ind.total],
    ['Duração média', formatarDuracao(ind.duracaoMedia)],
    ['Adicionadas manualmente', `${ind.percentualManuais.toFixed(1)}%`],
    ['Jogos concluídos', ind.totalVitorias], // cada jogo gera uma vitória
    ['Maior nº de vitórias', ind.maxVitorias]
  ];
  document.getElementById('indicadores').replaceChildren(...cartoes.map(([rotulo, valor]) =>
    el('div', { className: 'indicador' }, [
      el('span', { className: 'indicador-valor', textContent: valor }),
      el('span', { className: 'indicador-rotulo', textContent: rotulo })
    ])
  ));

  const ranking = document.getElementById('ranking');
  if (ind.ranking.length) {
    ranking.replaceChildren(...ind.ranking.map(m =>
      el('li', { textContent: `${m.titulo} - ${m.artista?.nome_artista ?? ''} (${m.vitorias} vitória${m.vitorias === 1 ? '' : 's'})` })
    ));
  } else {
    ranking.replaceChildren(el('li', { className: 'vazio', textContent: 'Nenhuma música venceu um jogo ainda.' }));
  }

  const generos = Object.entries(ind.porGenero).sort((a, b) => b[1].musicas - a[1].musicas);
  document.querySelector('#tabela-generos tbody').replaceChildren(...generos.map(([g, d]) =>
    el('tr', {}, [
      el('td', { textContent: g }),
      el('td', { textContent: d.musicas }),
      el('td', { textContent: d.vitorias }),
      el('td', { textContent: formatarDuracao(d.duracao / d.musicas) })
    ])
  ));

  atualizarGrafico('ranking', 'grafico-ranking', 'bar',
    ind.ranking.map(m => m.titulo),
    ind.ranking.map(m => m.vitorias),
    'Vitórias');
  atualizarGrafico('generos', 'grafico-generos', 'doughnut',
    generos.map(([g]) => g),
    generos.map(([, d]) => d.musicas),
    'Músicas');
}

function atualizarGrafico(nome, idCanvas, tipo, rotulos, valores, legenda) {
  if (typeof Chart === 'undefined') return; // Chart.js não carregou
  const grafico = graficos[nome];
  if (grafico) {
    grafico.data.labels = rotulos;
    grafico.data.datasets[0].data = valores;
    grafico.update();
    return;
  }
  graficos[nome] = new Chart(document.getElementById(idCanvas), {
    type: tipo,
    data: {
      labels: rotulos,
      datasets: [{
        label: legenda,
        data: valores,
        backgroundColor: tipo === 'bar'
          ? CORES_GRAFICOS[0]
          : contexto => CORES_GRAFICOS[contexto.dataIndex % CORES_GRAFICOS.length]
      }]
    },
    options: {
      responsive: true,
      aspectRatio: 2,
      plugins: { legend: { display: tipo !== 'bar' } },
      ...(tipo === 'bar' && { scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } })
    }
  });
}

// ---------- Jogo ----------

function nomeDaFase(quantidade) {
  if (quantidade === 2) return 'Final';
  if (quantidade === 4) return 'Semifinal';
  if (quantidade === 8) return 'Quartas de final';
  if (quantidade === 16) return 'Oitavas de final';
  return `Fase de ${quantidade}`;
}

function iniciarJogo(evento) {
  evento.preventDefault();
  const tamanho = Number(document.getElementById('jogo-tamanho').value);
  const genero = document.getElementById('jogo-genero').value;
  const candidatas = musicas.filter(m => !genero || m.genero === genero);

  if (candidatas.length < tamanho) {
    mostrarMensagem(
      `São necessárias ${tamanho} músicas${genero ? ` de ${genero}` : ''}, mas o banco tem ${candidatas.length}. ` +
      'Importe mais músicas ou escolha um jogo menor.', 'erro');
    return;
  }

  jogo = {
    faseAtual: embaralhar([...candidatas]).slice(0, tamanho),
    proximaFase: [],
    indice: 0,
    round: 1,
    totalRounds: tamanho - 1
  };
  document.getElementById('mensagem').hidden = true;
  document.getElementById('form-jogo').hidden = true;
  document.getElementById('vencedor').hidden = true;
  document.getElementById('confronto').hidden = false;
  mostrarConfronto();
}

function mostrarConfronto() {
  const par = [jogo.faseAtual[jogo.indice], jogo.faseAtual[jogo.indice + 1]];
  document.getElementById('confronto-fase').textContent = nomeDaFase(jogo.faseAtual.length);
  document.getElementById('confronto-progresso').textContent = `Round ${jogo.round} de ${jogo.totalRounds}`;

  document.querySelectorAll('#confronto .opcao').forEach((botao, i) => {
    const m = par[i];
    const img = botao.querySelector('img');
    img.hidden = !m.url_capa;
    if (m.url_capa) img.src = m.url_capa;
    img.alt = `Capa de ${m.titulo}`;
    botao.querySelector('.opcao-titulo').textContent = m.titulo;
    botao.querySelector('.opcao-artista').textContent = m.artista?.nome_artista ?? '';
  });
}

function escolher(lado) {
  jogo.proximaFase.push(jogo.faseAtual[jogo.indice + lado]);
  jogo.indice += 2;
  jogo.round++;

  if (jogo.indice >= jogo.faseAtual.length) {
    if (jogo.proximaFase.length === 1) {
      finalizarJogo(jogo.proximaFase[0]);
      return;
    }
    jogo.faseAtual = jogo.proximaFase;
    jogo.proximaFase = [];
    jogo.indice = 0;
  }
  mostrarConfronto();
}

async function finalizarJogo(vencedora) {
  jogo = null;
  document.getElementById('confronto').hidden = true;

  // $inc soma 1 sem precisar saber o valor atual
  await executar('Registrando vitória...', null, async () => {
    await alterarMusica(vencedora._id, {
      $inc: { vitorias: 1 },
      $set: { atualizado_em: new Date().toISOString() }
    });
    await recarregar();
  });

  const atualizada = porChave(chave(vencedora)) ?? vencedora;
  const capa = document.getElementById('vencedor-capa');
  capa.hidden = !atualizada.url_capa;
  if (atualizada.url_capa) capa.src = atualizada.url_capa;
  capa.alt = `Capa de ${atualizada.titulo}`;
  document.getElementById('vencedor-titulo').textContent = atualizada.titulo;
  document.getElementById('vencedor-artista').textContent = atualizada.artista?.nome_artista ?? '';
  document.getElementById('vencedor-vitorias').textContent = `Total de vitórias desta música: ${atualizada.vitorias ?? 0}`;
  document.getElementById('vencedor').hidden = false;
}

function voltarAoInicioDoJogo() {
  jogo = null;
  document.getElementById('confronto').hidden = true;
  document.getElementById('vencedor').hidden = true;
  document.getElementById('form-jogo').hidden = false;
}

// ---------- Início ----------

function ligarEventos() {
  document.getElementById('form-jogo').addEventListener('submit', iniciarJogo);
  document.querySelectorAll('#confronto .opcao').forEach(botao =>
    botao.addEventListener('click', () => escolher(Number(botao.dataset.lado))));
  document.getElementById('jogo-abandonar').addEventListener('click', () => {
    if (confirm('Abandonar o jogo? O progresso será perdido.')) voltarAoInicioDoJogo();
  });
  document.getElementById('jogo-novo').addEventListener('click', voltarAoInicioDoJogo);

  document.getElementById('busca').addEventListener('input', renderizarLista);
  document.getElementById('filtro-genero').addEventListener('change', renderizarLista);
  document.getElementById('filtro-origem').addEventListener('change', renderizarLista);
  document.getElementById('lista-musicas').addEventListener('click', aoClicarNaLista);

  document.getElementById('form-musica').addEventListener('submit', aoEnviarFormulario);
  document.getElementById('form-cancelar').addEventListener('click', sairDaEdicao);

  document.getElementById('form-importar').addEventListener('submit', async evento => {
    evento.preventDefault();
    const select = document.getElementById('importar-genero');
    if (!select.value) {
      mostrarMensagem('Escolha um gênero para importar.', 'erro');
      return;
    }
    const nome = select.selectedOptions[0].textContent;
    const botao = evento.submitter;
    if (botao) botao.disabled = true;
    await executar('Buscando músicas no Deezer...',
      r => `${nome}: ${r.novas} música(s) nova(s), ${r.existentes} já estava(m) no banco.`,
      async () => {
        const resultado = await importar(select.value, nome);
        await recarregar();
        return resultado;
      });
    if (botao) botao.disabled = false;
  });
}

async function iniciar() {
  ligarEventos();
  renderizarLista();
  renderizarPainel();
  await executar('Conectando ao banco...', null, async () => {
    await garantirColecoes();
    await recarregar();
  });
  await carregarGenerosDeezer();
}

iniciar();
