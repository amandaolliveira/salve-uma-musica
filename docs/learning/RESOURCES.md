# Postman and Docker Resources

## Knowledge

- [Docker docs: What is a container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/)
  Containers vs VMs, port mapping, lifecycle commands. Use for: first-principles explanation of containers.
- [Docker docs: Get started with Docker Compose](https://docs.docker.com/compose/gettingstarted/)
  Official tutorial for `up -d`, `logs -f`, `down`, `down -v`. Use for: compose commands. It does not cover `docker compose ps`; check `docker compose ps --help`.
- [MongoDB docs: Documents](https://www.mongodb.com/docs/manual/core/document/)
  Documents, fields, `_id`. Use for: lesson 2 data-model vocabulary (link not yet opened by me).
- [Postman docs: Send your first request](https://learning.postman.com/docs/getting-started/first-steps/sending-the-first-request/)
  Official first-request walkthrough. Use for: lesson on Postman basics.
- [RESTHeart docs: MongoDB REST API tutorial](https://restheart.org/docs/mongodb-rest/tutorial)
  Collection creation, CRUD verbs, default `admin`/`secret`, Location header. Use for: every RESTHeart request in the project.

- [MDN: Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
  Why a page cannot read responses from another origin without `Access-Control-Allow-Origin`. Use for: lesson 4.
- [nginx docs: proxy module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
  `proxy_pass` and related directives. Use for: lesson 4, `nginx/default.conf`.

## Wisdom (Communities)

- Not yet researched. Candidates to check later: Postman Community forum, Docker Community Forums.

## Gaps

- Authoritative page for Postman Basic Auth, variables and collection export (not yet read).
- RESTHeart page listing exact status codes for PUT/PATCH on existing documents. Tested on this project's RESTHeart instead: both return 200.
