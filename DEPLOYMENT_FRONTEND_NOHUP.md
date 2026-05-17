# Frontend deployment to 172.16.0.3 with GitLab CI and nohup

This deployment does not copy frontend source code to the server.

## Flow

1. GitLab CI builds the Next.js standalone application.
2. GitLab CI creates `frontend-standalone.tar.gz`.
3. GitLab CI uploads the tarball and restart script to `172.16.0.3`.
4. The server extracts the app into `/home/test/tselot_Studio/frontend/current`.
5. The server reads `/home/test/tselot_Studio/frontend/frontend.env`.
6. The server starts the frontend using `nohup node server.js`.

## Required server files

```txt
/home/test/tselot_Studio/frontend/
  frontend.env
  current/
  logs/
```

## Required GitLab CI/CD variable

```txt
SSH_PRIVATE_KEY
```

## Optional GitLab CI/CD build variables

```txt
FRONTEND_BACKEND_URL=http://127.0.0.1:8080
FRONTEND_KARAVAN_URL=http://localhost:8081
FRONTEND_HAWTIO_URL=https://camel.hawt.io/online/login?redirectUri=http%3A%2F%2Fcamel.hawt.io%2Fonline%2F
```
