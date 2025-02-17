# ToastieBun

[![Unit Test](https://github.com/IsCoffeeTho/toastiebun/actions/workflows/test-bun.yml/badge.svg)](https://github.com/IsCoffeeTho/toastiebun/actions/workflows/test-bun.yml)

[**`git`**](https://github.com/IsCoffeeTho/toastiebun) | [**`npm`**](https://www.npmjs.com/package/toastiebun) | [**`wiki`**](https://github.com/IsCoffeeTho/toastiebun/wiki)

ToastieBun is an express like bun based http server framework.

<img src="https://raw.githubusercontent.com/IsCoffeeTho/toastiebun/v0.4.3/assets/toastiebun.svg" height="300px" alt="Toastie (The Cat)">

## Installation
```bash
bun install toastiebun
```
### Usage
```ts
// index.ts

import toastiebun from "toastiebun";

const app = new toastiebun.server();

app.get("/", (req, res) => {
	res.send("Hello from Toastiebun");
})

app.listen("127.0.0.1", 8000);
```
![Hello from Tostiebun](./docs/assets/HelloWorld.png)

## Development
```bash
# Unit Tests
bun test

# Mock Server @ http://localhost:3000
bun start :: 3000
```