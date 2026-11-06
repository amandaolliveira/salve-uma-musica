// Usado por todas as páginas de docs/learning: troca de idioma (EN / pt-BR), barra do topo e anterior/próxima.
// Cada pasta de aulas (base, trilha-*) tem um trilha.js com a lista das suas aulas, carregado antes deste arquivo.
// As páginas têm os dois idiomas: <section lang="en"> e <section lang="pt-BR">.
(function () {
  var assets = new URL('./', document.currentScript.src).href;
  var home = new URL('../index.html', assets).href;
  var TRILHA = window.TRILHA || null;
  var TEXT = {
    home: { en: 'Home', 'pt-BR': 'Início' },
    prev: { en: 'Previous', 'pt-BR': 'Anterior' },
    next: { en: 'Next', 'pt-BR': 'Próxima' },
    lessons: { en: 'Lessons', 'pt-BR': 'Aulas' }
  };
  var root = document.documentElement;

  function bi(obj) { return '<span lang="en">' + obj.en + '</span><span lang="pt-BR">' + obj['pt-BR'] + '</span>'; }
  function stored() { try { return localStorage.getItem('lang'); } catch (e) { return null; } }

  function atual() {
    if (!TRILHA) return -1;
    var nome = decodeURIComponent(location.pathname.split('/').pop());
    for (var i = 0; i < TRILHA.aulas.length; i++) if (TRILHA.aulas[i].arquivo === nome) return i;
    return -1;
  }

  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.lang = lang;
    try { localStorage.setItem('lang', lang); } catch (e) { /* modo privado: a escolha só não fica salva */ }
    var i = atual();
    if (i >= 0) document.title = TRILHA.aulas[i].titulo[lang];
    else if (TRILHA) document.title = TRILHA.titulo[lang];
    document.querySelectorAll('.langs button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
  }

  var saved = stored();
  setLang(saved === 'en' || saved === 'pt-BR' ? saved : (navigator.language || '').toLowerCase().indexOf('pt') === 0 ? 'pt-BR' : 'en');

  function link(aula, label, setaAntes) {
    if (!aula) return '<span></span>';
    var texto = '<small>' + bi(TEXT[label]) + '</small><br>' + bi(aula.titulo);
    return '<a href="' + aula.arquivo + '">' + (setaAntes ? '&larr; ' : '') + texto + (setaAntes ? '' : ' &rarr;') + '</a>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var bar = document.createElement('nav');
    bar.className = 'bar';
    var trilha = TRILHA ? ' / <a href="index.html">' + bi(TRILHA.titulo) + '</a>' : '';
    bar.innerHTML = '<span><a href="' + home + '">' + bi(TEXT.home) + '</a>' + trilha + '</span>' +
      '<span class="langs"><button data-lang="en">EN</button><button data-lang="pt-BR">PT-BR</button></span>';
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelectorAll('.langs button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.lang); }); });

    var i = atual();
    if (i >= 0) {
      var pager = document.createElement('nav');
      pager.className = 'pager';
      pager.innerHTML = link(TRILHA.aulas[i - 1], 'prev', true) + link(TRILHA.aulas[i + 1], 'next', false);
      document.body.appendChild(pager);
    }

    var toc = document.getElementById('toc');
    if (toc && TRILHA) {
      var html = '';
      TRILHA.aulas.forEach(function (a) {
        html += '<li><a href="' + a.arquivo + '">' + bi(a.titulo) + '</a><br><span class="note">' + bi(a.desc) + '</span></li>';
      });
      toc.innerHTML = '<h2>' + bi(TEXT.lessons) + '</h2><ol>' + html + '</ol>';
    }
    setLang(root.getAttribute('data-lang'));
  });
})();
