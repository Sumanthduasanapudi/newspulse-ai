# NewsPulse Authentication and Credential Flow

## Architecture

```text
React client
    |
    | HTTP /api/*
    | optional Authorization: Bearer <API_BEARER_TOKEN>
    v
Express backend (:5000)
    |
    | x-internal-key: <INTERNAL_API_KEY>
    v
FastAPI AI layer (:8000)
    |
    | server-side ANTHROPIC_API_KEY
    v
Anthropic Claude API
```

## 1. Client -> Express

All `/api/*` routes pass through `requireBearerToken`.

`API_BEARER_TOKEN` is optional so the existing local React frontend continues to work without placing a secret in the browser bundle.

- If `API_BEARER_TOKEN` is empty, `/api/*` works as before.
- If it is configured, clients must send:

```http
Authorization: Bearer <token>
```

The backend compares the supplied token with `crypto.timingSafeEqual`.

Do not put a private production bearer token in `REACT_APP_*` variables: Create React App embeds those values in browser JavaScript.

## 2. Express -> FastAPI

Set the same `INTERNAL_API_KEY` value in:

- `backend_layer/.env`
- `ai_layer/.env`

Express sends it to FastAPI as:

```http
x-internal-key: <INTERNAL_API_KEY>
```

FastAPI checks the key for protected AI routes. Requests with a missing or incorrect key receive HTTP `401` when internal authentication is enabled.

The root, health check, and API documentation endpoints remain public for diagnostics.

## 3. FastAPI -> Anthropic

The Anthropic key remains server-side in `ai_layer/.env`:

```env
ANTHROPIC_API_KEY=...
```

It is loaded by the Python AI layer and used by `ChatAnthropic`. It is never sent to React or the Express client response.

## Local setup

Copy the examples:

```text
backend_layer/.env.example -> backend_layer/.env
ai_layer/.env.example      -> ai_layer/.env
```

Generate a long random value for `INTERNAL_API_KEY` and use exactly the same value in both files.

For normal local React development, leave `API_BEARER_TOKEN` empty.

## Public deployment

For a public deployment:

1. Keep FastAPI on a private/internal network when possible.
2. Configure `INTERNAL_API_KEY` in both services.
3. Do not expose `ANTHROPIC_API_KEY`, `INTERNAL_API_KEY`, or other secrets in frontend environment variables.
4. Use HTTPS at the public edge.
5. For multi-user authentication, replace the optional static bearer-token gate with a real identity system (OIDC/OAuth, Auth0, Clerk, Cognito, Firebase Auth, etc.) and validate signed user tokens at the backend.

## Secret handling

The repository `.gitignore` excludes `.env` and `.env.*` while allowing `.env.example`. Commit placeholders only; never commit real keys.
