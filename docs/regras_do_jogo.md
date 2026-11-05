# Salve Uma Música

## Qual a premissa do jogo?

A ideia é começar com 32 músicas, e apenas uma dessas 32 sobra.
Da perspectiva do jogador, a tela mostra 2 músicas, e terá que escolher uma das duas até todas as outras serem eliminadas.

## Termos

- **Round** é ter que escolher UMA música entre duas.
- **Jogo** equivale a todo o processo, ou seja, os 32 rounds.

## Mecânicas

- Jogos curtos ou extensos (8, 16, 32, 64 rounds).
- Jogos por gênero de música.
- Possibilidade de adicionar novas músicas manualmente.

## De que forma é feita a seleção das músicas?

É utilizado a [API pública do DEEZER](https://api.deezer.com/), que retorna diversas informações sobre músicas, albuns e artistas.
<br>
A seleção de músicas é feita utilizando o endpoint de CHARTS, que retorna as músicas em alta, podendo as filtrar por gênero.

## Exemplos de Rotas na API do Deezer

<details>
<summary>Todas as músicas em alta</summary>

```json
// https://api.deezer.com/chart/
{
  "tracks": {
    "data": [
      {
        "id": 4337389322,
        "title": "Pós (Ao Vivo)",
        "title_short": "Pós",
        "title_version": "(Ao Vivo)",
        "link": "https://www.deezer.com/track/4337389322",
        "duration": 175,
        "rank": 988594,
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/7/e/4/0/7e4d7311461b6f6d398bb550ec7a8e2e.mp3?hdnea=exp=1793833360~acl=/api/1/1/7/e/4/0/7e4d7311461b6f6d398bb550ec7a8e2e.mp3*~data=user_id=0,application_id=42~hmac=ca7987af2053f021f09ac3beab12ee343a6caad2495a37b4d94be5c95de4183d",
        "md5_image": "4c07cc728fd1531094bbf11235afef34",
        "position": 1,
        "artist": {
          "id": 172071177,
          "name": "Felipe e Rodrigo",
          "link": "https://www.deezer.com/artist/172071177",
          "picture": "https://api.deezer.com/artist/172071177/image",
          "picture_small": "https://cdn-images.dzcdn.net/images/artist/8a708000573bc036a557771329d13932/56x56-000000-80-0-0.jpg",
          "picture_medium": "https://cdn-images.dzcdn.net/images/artist/8a708000573bc036a557771329d13932/250x250-000000-80-0-0.jpg",
          "picture_big": "https://cdn-images.dzcdn.net/images/artist/8a708000573bc036a557771329d13932/500x500-000000-80-0-0.jpg",
          "picture_xl": "https://cdn-images.dzcdn.net/images/artist/8a708000573bc036a557771329d13932/1000x1000-000000-80-0-0.jpg",
          "radio": true,
          "tracklist": "https://api.deezer.com/artist/172071177/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": 1117358492,
          "title": "Pós (Ao Vivo)",
          "cover": "https://api.deezer.com/album/1117358492/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/4c07cc728fd1531094bbf11235afef34/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/4c07cc728fd1531094bbf11235afef34/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/4c07cc728fd1531094bbf11235afef34/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/4c07cc728fd1531094bbf11235afef34/1000x1000-000000-80-0-0.jpg",
          "md5_image": "4c07cc728fd1531094bbf11235afef34",
          "tracklist": "https://api.deezer.com/album/1117358492/tracks",
          "type": "album"
        },
        "type": "track"
      }
      // . . .
    ]
  }
}
```

</details>

<br>

<details>
<summary>Todas as músicas em alta, do gênero "Hard Rock" (id 152)</summary>

```json
// https://api.deezer.com/chart/152
{
  "tracks": {
    "data": [
      {
        "id": 518458172,
        "title": "Sweet Child O' Mine",
        "title_short": "Sweet Child O' Mine",
        "title_version": "",
        "link": "https://www.deezer.com/track/518458172",
        "duration": 355,
        "rank": 934281,
        "explicit_lyrics": false,
        "explicit_content_lyrics": 0,
        "explicit_content_cover": 0,
        "preview": "https://cdnt-preview.dzcdn.net/api/1/1/5/9/1/0/59115eec88ea0bc7742eaba93facf49b.mp3?hdnea=exp=1793833725~acl=/api/1/1/5/9/1/0/59115eec88ea0bc7742eaba93facf49b.mp3*~data=user_id=0,application_id=42~hmac=5a4c0780a8afd95f85ba3f86dcaa58baba9b38faf9460bbad257c5b7715d58a6",
        "md5_image": "8bfe7b3b0985d9ff0751090fb2b6f73f",
        "position": 1,
        "artist": {
          "id": 663,
          "name": "Guns N' Roses",
          "link": "https://www.deezer.com/artist/663",
          "picture": "https://api.deezer.com/artist/663/image",
          "picture_small": "https://cdn-images.dzcdn.net/images/artist/c62989722e38d7a2ab18afde3c19bc5c/56x56-000000-80-0-0.jpg",
          "picture_medium": "https://cdn-images.dzcdn.net/images/artist/c62989722e38d7a2ab18afde3c19bc5c/250x250-000000-80-0-0.jpg",
          "picture_big": "https://cdn-images.dzcdn.net/images/artist/c62989722e38d7a2ab18afde3c19bc5c/500x500-000000-80-0-0.jpg",
          "picture_xl": "https://cdn-images.dzcdn.net/images/artist/c62989722e38d7a2ab18afde3c19bc5c/1000x1000-000000-80-0-0.jpg",
          "radio": true,
          "tracklist": "https://api.deezer.com/artist/663/top?limit=50",
          "type": "artist"
        },
        "album": {
          "id": 66644272,
          "title": "Appetite For Destruction (Super Deluxe Edition)",
          "cover": "https://api.deezer.com/album/66644272/image",
          "cover_small": "https://cdn-images.dzcdn.net/images/cover/8bfe7b3b0985d9ff0751090fb2b6f73f/56x56-000000-80-0-0.jpg",
          "cover_medium": "https://cdn-images.dzcdn.net/images/cover/8bfe7b3b0985d9ff0751090fb2b6f73f/250x250-000000-80-0-0.jpg",
          "cover_big": "https://cdn-images.dzcdn.net/images/cover/8bfe7b3b0985d9ff0751090fb2b6f73f/500x500-000000-80-0-0.jpg",
          "cover_xl": "https://cdn-images.dzcdn.net/images/cover/8bfe7b3b0985d9ff0751090fb2b6f73f/1000x1000-000000-80-0-0.jpg",
          "md5_image": "8bfe7b3b0985d9ff0751090fb2b6f73f",
          "tracklist": "https://api.deezer.com/album/66644272/tracks",
          "type": "album"
        },
        "type": "track"
      }
      // . . .
    ]
  }
}
```
</details>

<br>

<details>
<summary>Música "Smooth Criminal" (id 59509511)</summary>

```json
// https://api.deezer.com/track/59509511
{
  "id": 59509511,
  "readable": true,
  "title": "Smooth Criminal (2012 Remaster)",
  "title_short": "Smooth Criminal",
  "title_version": "(2012 Remaster)",
  "isrc": "USSM11204989",
  "link": "https://www.deezer.com/track/59509511",
  "share": "https://www.deezer.com/track/59509511?utm_source=deezer&utm_content=track-59509511&utm_term=0_1793833359&utm_medium=web",
  "duration": 257,
  "track_position": 10,
  "disk_number": 1,
  "rank": 681052,
  "release_date": "2012-09-17",
  "explicit_lyrics": false,
  "explicit_content_lyrics": 0,
  "explicit_content_cover": 0,
  "preview": "https://cdnt-preview.dzcdn.net/api/1/1/7/e/2/0/7e2da8dd60171f6c5f17dc969f92d741.mp3?hdnea=exp=1793834259~acl=/api/1/1/7/e/2/0/7e2da8dd60171f6c5f17dc969f92d741.mp3*~data=user_id=0,application_id=42~hmac=998ce14d78f5ac2b4810228c9986b32d849c9c5491916cd804f9d83050c9bcf4",
  "bpm": 0,
  "gain": -9.2,
  "available_countries": [
    "AE",
    "AF",
    "AG",
    "AI",
    "AL",
    "AM",
    "AO",
    "AR",
    "AT",
    "AU",
    "AZ",
    "BA",
    "BB",
    "BD",
    "BE",
    "BF",
    "BG",
    "BH",
    "BI",
    "BJ",
    "BN",
    "BO",
    "BQ",
    "BR",
    "BT",
    "BW",
    "BY",
    "CA",
    "CD",
    "CF",
    "CG",
    "CH",
    "CI",
    "CL",
    "CM",
    "CN",
    "CO",
    "CR",
    "CU",
    "CV",
    "CW",
    "CY",
    "CZ",
    "DE",
    "DJ",
    "DK",
    "DM",
    "DO",
    "DZ",
    "EC",
    "EE",
    "EG",
    "EH",
    "ER",
    "ES",
    "ET",
    "FI",
    "FJ",
    "FR",
    "GA",
    "GB",
    "GD",
    "GE",
    "GH",
    "GM",
    "GN",
    "GQ",
    "GR",
    "GT",
    "GW",
    "HK",
    "HN",
    "HR",
    "HU",
    "ID",
    "IE",
    "IL",
    "IN",
    "IQ",
    "IR",
    "IS",
    "IT",
    "JM",
    "JO",
    "JP",
    "KE",
    "KG",
    "KH",
    "KI",
    "KM",
    "KN",
    "KR",
    "KW",
    "KY",
    "KZ",
    "LA",
    "LB",
    "LC",
    "LK",
    "LR",
    "LS",
    "LT",
    "LU",
    "LV",
    "LY",
    "MA",
    "MD",
    "ME",
    "MG",
    "MH",
    "MK",
    "ML",
    "MN",
    "MR",
    "MS",
    "MT",
    "MU",
    "MV",
    "MW",
    "MX",
    "MY",
    "MZ",
    "NA",
    "NE",
    "NG",
    "NI",
    "NL",
    "NO",
    "NP",
    "NR",
    "NZ",
    "OM",
    "PA",
    "PE",
    "PG",
    "PH",
    "PK",
    "PL",
    "PN",
    "PS",
    "PT",
    "PW",
    "PY",
    "QA",
    "RO",
    "RS",
    "RU",
    "RW",
    "SA",
    "SB",
    "SC",
    "SD",
    "SE",
    "SG",
    "SI",
    "SK",
    "SL",
    "SN",
    "SO",
    "SS",
    "ST",
    "SV",
    "SX",
    "SZ",
    "TC",
    "TD",
    "TG",
    "TH",
    "TJ",
    "TM",
    "TN",
    "TO",
    "TR",
    "TV",
    "TW",
    "TZ",
    "UA",
    "UG",
    "US",
    "UY",
    "UZ",
    "VC",
    "VE",
    "VG",
    "VN",
    "VU",
    "WS",
    "YE",
    "ZA",
    "ZM",
    "ZW"
  ],
  "contributors": [
    {
      "id": 259,
      "name": "Michael Jackson",
      "link": "https://www.deezer.com/artist/259",
      "share": "https://www.deezer.com/artist/259?utm_source=deezer&utm_content=artist-259&utm_term=0_1793833359&utm_medium=web",
      "picture": "https://api.deezer.com/artist/259/image",
      "picture_small": "https://cdn-images.dzcdn.net/images/artist/97fae13b2b30e4aec2e8c9e0c7839d92/56x56-000000-80-0-0.jpg",
      "picture_medium": "https://cdn-images.dzcdn.net/images/artist/97fae13b2b30e4aec2e8c9e0c7839d92/250x250-000000-80-0-0.jpg",
      "picture_big": "https://cdn-images.dzcdn.net/images/artist/97fae13b2b30e4aec2e8c9e0c7839d92/500x500-000000-80-0-0.jpg",
      "picture_xl": "https://cdn-images.dzcdn.net/images/artist/97fae13b2b30e4aec2e8c9e0c7839d92/1000x1000-000000-80-0-0.jpg",
      "radio": true,
      "tracklist": "https://api.deezer.com/artist/259/top?limit=50",
      "type": "artist",
      "role": "Main"
    }
  ],
  "md5_image": "cad261eafd0c6c15811200d5039b5b50",
  "track_token": "AAAAAWrruY9q7NLPttScd538FpjXqJAifyN9vjXy-8PVdXf58YCXWo1X8OlVoHtu4Klpih3uNgsi8UDkJkCBUK1JsPIYWKO8HNyzifgmwyonjnR_7gHoeuUCC9-zHma87viI1M2JYNibDjE0xMp7ERvUSOVb3faq27BpdV_LCkBqzApBU9zIkOo7HzF9po1yAU4lQ82c_kEm7cih8Onxq_AG-1Av2EHE9D_ML-jcSOhplFs-_xF_TlLmrT4vRr23NVubrYdZXajyW9jO8NJIVfHyq0npnbjoYAhICH0ZKhmgu5-iGZD61VnxkJwcAetgn50nG44jnCXF-anbQE_hSq9XtcBquFT0-OUSPyxlmQwL7-87LPAFclLFFfYUetH1BA2D9aYB_hBwB-rTLon1y8o3bIC0Bh5pIYczjO2Loh9o_3jUR1Ks7sRLVsJ8nB7GKRynMg6e4UKzvCd-l8HbJpcwYRmctxz0Y3TvAJxvb-8fKP02GX3QpmE7CB8V6oK94wUx9uUfDcB67vfd-GRqgitt3aeTViej",
  "artist": {
    "id": 259,
    "name": "Michael Jackson",
    "link": "https://www.deezer.com/artist/259",
    "share": "https://www.deezer.com/artist/259?utm_source=deezer&utm_content=artist-259&utm_term=0_1793833359&utm_medium=web",
    "picture": "https://api.deezer.com/artist/259/image",
    "picture_small": "https://cdn-images.dzcdn.net/images/artist/97fae13b2b30e4aec2e8c9e0c7839d92/56x56-000000-80-0-0.jpg",
    "picture_medium": "https://cdn-images.dzcdn.net/images/artist/97fae13b2b30e4aec2e8c9e0c7839d92/250x250-000000-80-0-0.jpg",
    "picture_big": "https://cdn-images.dzcdn.net/images/artist/97fae13b2b30e4aec2e8c9e0c7839d92/500x500-000000-80-0-0.jpg",
    "picture_xl": "https://cdn-images.dzcdn.net/images/artist/97fae13b2b30e4aec2e8c9e0c7839d92/1000x1000-000000-80-0-0.jpg",
    "radio": true,
    "tracklist": "https://api.deezer.com/artist/259/top?limit=50",
    "type": "artist"
  },
  "album": {
    "id": 5814031,
    "title": "Bad (Remastered)",
    "link": "https://www.deezer.com/album/5814031",
    "cover": "https://api.deezer.com/album/5814031/image",
    "cover_small": "https://cdn-images.dzcdn.net/images/cover/cad261eafd0c6c15811200d5039b5b50/56x56-000000-80-0-0.jpg",
    "cover_medium": "https://cdn-images.dzcdn.net/images/cover/cad261eafd0c6c15811200d5039b5b50/250x250-000000-80-0-0.jpg",
    "cover_big": "https://cdn-images.dzcdn.net/images/cover/cad261eafd0c6c15811200d5039b5b50/500x500-000000-80-0-0.jpg",
    "cover_xl": "https://cdn-images.dzcdn.net/images/cover/cad261eafd0c6c15811200d5039b5b50/1000x1000-000000-80-0-0.jpg",
    "md5_image": "cad261eafd0c6c15811200d5039b5b50",
    "release_date": "2012-09-17",
    "tracklist": "https://api.deezer.com/album/5814031/tracks",
    "type": "album"
  },
  "type": "track"
}
```
</details>
