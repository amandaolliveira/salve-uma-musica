# Estrutura das coleções

## Pontos importantes

Não existe usuários nesse jogo, é um aplicativo que depende de armazenamento **local** - Portanto, não existirá `tabela`/`collection` de usuários, e não haverá login.

## Cheatsheet

`coleção`/`collection` = Tabela<br>
`documento`/`document` = Um registro dentro da coleção (ou linha)<br>
`campo`/`field` = Um atributo dentro do registro (nome, cpf, telefone...)<br>
`_id` = É o equivalente de _primary_key_

## Collections internas do Jogo

### musica
```js
{
    _id: 1,
    titulo: "The Ghost of You",
    artista: {
        id_artista: 5,
        nome_artista: "My Chemical Romance"
    },
    duracao: 197,
    adicionado_manualmente: false,    
    url_capa: "https://capasdemusica/ghostofyou" //faz sentido ter uma URL opcional por track, pois algumas músicas são SINGLES
}
```

### artista
```js
{
    _id: 5,
    nome: "My Chemical Romance",
    url_foto: "https://artistasmusicais/mychemicalromance"
}
```
