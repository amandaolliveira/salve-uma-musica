# Estrutura das coleções

## Pontos importantes

Não existe usuários nesse jogo, é um aplicativo que depende de armazenamento **local** - Portanto, não existirá `tabela`/`collection` de usuários, e não haverá login.

## Cheatsheet

`coleção`/`collection` = Tabela<br>
`documento`/`document` = Um registro dentro da coleção (ou linha)<br>
`campo`/`field` = Um atributo dentro do registro (nome, cpf, telefone...)<br>
`_id` = É o equivalente de _primary_key_

## Collections internas do Jogo

As duas ficam no banco `restheart` (o nome que o RESTHeart usa por padrão).

### musica
```js
{
    _id: 1, // id da faixa no Deezer. Se a música foi adicionada manualmente, o MongoDB gera um ObjectId
    titulo: "The Ghost of You",
    artista: {
        id_artista: 5, // null quando a música foi adicionada manualmente
        nome_artista: "My Chemical Romance"
    },
    duracao: 197, // em segundos
    adicionado_manualmente: false,
    url_capa: "https://capasdemusica/ghostofyou", //faz sentido ter uma URL opcional por track, pois algumas músicas são SINGLES
    genero: "Rock", // gênero escolhido na importação, não vem da faixa
    vitorias: 0, // quantas vezes a música venceu um jogo
    criado_em: "2026-11-05T22:40:00.000Z",
    atualizado_em: "2026-11-06T10:15:00.000Z" // só existe depois de um PUT ou PATCH
}
```

### artista
```js
{
    _id: 5, // id do artista no Deezer
    nome: "My Chemical Romance",
    url_foto: "https://artistasmusicais/mychemicalromance"
}
```

> Como o `_id` das músicas importadas é um número, o RESTHeart precisa do `?id_type=NUMBER` na URL pra achar o documento (ex.: `/musica/1?id_type=NUMBER`).

## Justificativa

O nome do artista fica **embutido** na música (`artista.nome_artista`), porque ele aparece
em toda listagem e em todo round do jogo, assim uma unica leitura traz tudo, sem precisar de JOIN.

O resto do artista (a imagem) fica na coleção `artista`, **referenciado** pelo `id_artista`.
Um artista tem várias músicas e a imagem não é usada pelas telas, então não vale copiar em cada música.

O custo: se um artista mudar de nome, todas as músicas dele precisam ser atualizadas.

O `_id` das músicas importadas é o id do Deezer, assim, importar o mesmo gênero de novo
não duplica nada: o RESTHeart responde 409 e a música é ignorada.

## Verificação

Conferido no MongoDB Compass em 07/11/2026 (banco `restheart`):

- `musica`: 100 documentos (1 gênero importado: Rock)
- `artista`: 56 documentos
- Filtro `{ vitorias: { $gt: 0 } }`: 2 documentos, depois de 2 partidas
- Um documento tem `duracao` e `vitorias` (números), `criado_em` (data) e `artista` (objeto embutido)