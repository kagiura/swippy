# Atlas

Atlas is the backend web server for Project Zephyrus.

## Run locally

From the repository root:

```sh
pnpm install
cd atlas
pnpm dev
```

The server runs at `http://localhost:8787`.

To run it without file watching:

```sh
pnpm start
```

Check that it is running:

```sh
curl http://localhost:8787/health
```
