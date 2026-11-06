# Salve Uma Música

Um jogo onde aparecem duas músicas na tela e você escolhe uma, até sobrar só uma: a música "salva". As músicas vêm das paradas do Deezer e ficam salvas no MongoDB (via RESTHeart).

Mais detalhes em [docs/regras_do_jogo.md](docs/regras_do_jogo.md), [docs/features.md](docs/features.md) e [docs/estrutura_banco.md](docs/estrutura_banco.md).

## Integrantes

| Integrante | Papel |
|---|---|
| _(preencher)_ | Dados (modelagem e banco) |
| _(preencher)_ | API (requisições e Postman) |
| _(preencher)_ | Interface (CSS) |

## API utilizada

[API pública do Deezer](https://developers.deezer.com/api), sem chave. Usamos só GET:

- `/genre` - lista de gêneros
- `/chart/{id_genero}/tracks?limit=100` - músicas em alta do gênero

O Deezer não libera CORS pro navegador, então o nginx do container `frontend` faz um proxy: o front chama `/deezer/...` e o nginx repassa pra `https://api.deezer.com/...`.

## Como rodar

```bash
docker compose up -d     # sobe tudo
docker compose down      # para
docker compose down -v   # para e apaga os dados
```

Abra http://localhost:3000. As coleções são criadas sozinhas no primeiro acesso, mas o banco começa vazio - importe algum gênero na seção **Importar** antes de jogar.

> A importação só funciona pelo container (por causa do proxy). Abrindo o `index.html` direto, o resto funciona.

## Documento de exemplo

Coleção `musica`:

```json
{
  "_id": 518458172,
  "titulo": "Sweet Child O' Mine",
  "artista": {
    "id_artista": 663,
    "nome_artista": "Guns N' Roses"
  },
  "duracao": 355,
  "adicionado_manualmente": false,
  "url_capa": "https://cdn-images.dzcdn.net/images/cover/8bfe7b3b0985d9ff0751090fb2b6f73f/250x250-000000-80-0-0.jpg",
  "genero": "Rock",
  "vitorias": 0,
  "criado_em": "2026-11-05T22:40:00.000Z"
}
```

- O **nome** do artista fica embutido na música, porque aparece em todo lugar (lista, jogo) e assim não precisa de outra consulta.
- O resto do artista (foto) fica na coleção `artista`, **referenciado** pelo `id_artista`.
- Músicas importadas usam o id do Deezer como `_id`, então importar o mesmo gênero de novo não duplica nada. As adicionadas manualmente ganham um `ObjectId`.
- Campos nossos (não vêm da API): `adicionado_manualmente`, `genero`, `vitorias`, `criado_em` e `atualizado_em`.

## Endpoints

Base `http://localhost:8080`, usuário `admin` e senha `secret`.

| Ação | Método e URL | Status |
|---|---|---|
| Criar coleção | `PUT /musica` | 201 |
| Inserir | `POST /musica` | 201 (409 se o `_id` já existe) |
| Listar | `GET /musica?pagesize=1000` | 200 |
| Buscar por id | `GET /musica/{id}` | 200 / 404 |
| Editar | `PUT /musica/{id}` | 200 |
| Somar vitória | `PATCH /musica/{id}` | 200 |
| Excluir | `DELETE /musica/{id}` | 204 |

> Pra ids numéricos (músicas do Deezer), o RESTHeart precisa do `?id_type=NUMBER` no final da URL.

A coleção do Postman está em [postman/colecao.json](postman/colecao.json).

## Painel

- 5 indicadores: total de músicas, duração média, % adicionadas manualmente, jogos concluídos e maior nº de vitórias
- Gráfico de barras com o top 10 por vitórias e gráfico de rosca com músicas por gênero
- Ranking top 10 e tabela por gênero

Tudo é recalculado depois de cada alteração no banco.

_(prints pendentes)_

## Conclusão

_(pendente)_

## Uso de IA

Ver [docs/uso_de_ia.md](docs/uso_de_ia.md). As aulas que usamos para aprender estão em [docs/learning](docs/learning/index.html).
