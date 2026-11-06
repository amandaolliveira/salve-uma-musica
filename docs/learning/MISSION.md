# Mission: Postman and Docker containers for the NoSQL API project

## Why
Deliver the group project described in `docs/Atividade_APIs_NoSQL_HTTP_Frontend.pdf` (Deezer tracks saved to MongoDB through RESTHeart) and pass the Docker and HTTP-methods criteria (3.5 of 10 points, plus the +1.0 frontend-in-Docker extra), including the live demo on 09/11/2026.

## Success looks like
- Start, inspect, stop and wipe the MongoDB + RESTHeart + nginx environment with `docker compose` and explain each line of `docker-compose.yml`.
- Create the collection and run GET, POST, PUT, PATCH and DELETE in Postman against RESTHeart, reading the status codes (200, 201, 204, 404, 409).
- Have a Postman collection in `postman/colecao.json` that covers every request.
- Explain, during the presentation, why the data survives a restart (named volume) and why Deezer goes through the nginx proxy (CORS).

## Constraints
- Final delivery 08/11/2026; weekly milestones 25/10 and 01/11.
- Starting point: Docker Desktop installed but never used; Postman never used.
- Short lessons, hands-on against the real project.

## Out of scope
- Writing Dockerfiles, Kubernetes, Postman scripting beyond saving an ID variable, the Node/Express API (4-member group only).
