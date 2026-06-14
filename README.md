# stchar-cli

CLI tool for exporting characters into SillyTavern format.

## Features

- Export character card JSON
- Download avatar image
- Locale support(now Only KhuiAi)

## install dependencies

```bash
bun install
```

## Usage

```bash
bun src/main.ts download <url> --json --image --locale=en(optional)
```

Example:
```bash
bun src/main.ts download https://char.com/... --json --image
```

