# Getting Started

## Introduction

Welcome to **ToastieBun**, a lightweight and high-performance express-like HTTP(S) server framework tailored for the [Bun](https://bun.sh/) runtime. Built for speed and simplicity, ToastieBun provides an intuitive API to help developers quickly set up and manage web servers. This guide will walk you through the installation, setup, and fundamental features to get you started.

Note is that ToastieBun is **NOT** a drop in replacement for express.
## Prerequisites

Before you start, ensure you have the following:

- **Bun installed**: If you haven't installed Bun yet, follow the instructions at [Bun's official website](https://bun.sh/).
- **A working terminal** (Linux/macOS/Windows with WSL or Git Bash recommended).

To check if Bun is installed, run:

```bash
bun --version
```

## Creating your first ToastieBun Server

1. Create a new project folder and navigate into it:
	```bash
	mkdir my-website && cd my-website
	```
2. Initialize a Bun project:
	```bash
	bun init
	```
3. Install ToastieBun:
	```bash
	bun install toastiebun
	```
4. Create an `index.ts` file and add the following code:

    ```typescript
    import toastiebun from "toastiebun"; // v0.4.12

    const app = new toastiebun.server();

    app.get("/", (req, res) => {
    	res.send("Hello from ToastieBun");
    });

    app.listen("::", 8000, () => {
    	console.log("Server running at http://localhost:8000");
    });
    ```

5. Start the server:
    ```bash
    bun run index.ts
    ```

6. Open your browser and visit `http://localhost:8000`. You should see `Hello, ToastieBun!` displayed.
   ![Hello from Toasteibun](../assets/HelloWorld-example.png)
