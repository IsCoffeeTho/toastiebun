# Cross Origin Resource Sharing

## Implementing CORS Policy Headers

To implement a CORS (Cross-Origin Resource Sharing) policy using the `.options()` method in your server configuration, you can define allowed origins and use
them to restrict cross-origin requests. Here's how you can do it:

### Example Usage of `.options()`

The `options` method allows you to specify CORS options for specific paths. These options can include an array of allowed origins. When a client makes a
`OPTIONS` request to your server, your application should respond with appropriate headers that describe which origins are allowed and what methods are
supported.

#### Adding Allowed Origins

You can define the `cors` option when creating your server instance:

```typescript
const app = new toastiebun.server({
	cors: {
		allowedOrigins: ["http://example.com", "https://api.example.com"],
	},
});
```

Alternatively, you can configure CORS options for individual routes using the `options` method directly on those routes. For example:

```typescript
// This route will send appropriate CORS headers when an OPTIONS request is made to /protected/api.
app.options("/protected/api", {
	allowedOrigins: ["http://example.com", "https://api.example.com"],
});
```

### Complete Example

Here's a complete example demonstrating how to set up the server with CORS policy headers:

```typescript
const app = new toastiebun.server({
	cors: {
		allowedOrigins: ["http://example.com", "https://api.example.com"],
	},
});

// Define an OPTIONS route for CORS preflight checks.
app.options("/protected/api", {
	allowedOrigins: ["http://example.com", "https://api.example.com"],
});

// Define a GET route that requires CORS headers.
app.get("/protected/api", (req, res) => {
	// Handle the request logic here
	res.send("Protected API endpoint");
});

app.listen("::1", 3000, () => {
	console.log("Server is running on http://[::1]:3000");
});
```

In this example, when a client makes an `OPTIONS` request to the `/protected/api` endpoint, the server will respond with appropriate CORS headers, allowing
requests from the specified origins.

### Customizing CORS Options

You can customize the `allowedOrigins`, along with other optional parameters such as:

- `allowMethods`: Specifies allowed HTTP methods.
- `exposeHeaders`: Specifies additional headers to expose in responses.
- `maxAge`: Specifies how long results of a preflight request can be cached.

For example, you could also set these options like this:

```typescript
app.options("/protected/api", {
	allowMethods: ["GET", "POST"],
	exposeHeaders: ["X-Custom-Header"],
	maxAge: 86400, // Cache for one day in seconds
});
```

By using the `options` method, you can effectively control which origins are allowed to make requests and what methods those origins are permitted to use.

### Matching Dynamic Routes

In addition to static paths, you can also define routes that match dynamic segments using patterns such as `/path/:parameter` or `/path/*`. Here’s how you can
adjust the path definitions in your server configuration:

#### Using `:parameter`

For a route that needs to capture a specific parameter (e.g., user ID), you can use a named placeholder like this:

```typescript
// Define an OPTIONS route for CORS preflight checks.
app.options("/users/:userId", {
	allowedOrigins: ["http://example.com", "https://api.example.com"],
});

app.get("/users/:userId", (req, res) => {
	// Handle the request logic here
	const userId = req.params.userId;
	res.send(`User with id: ${userId}`);
});
```

#### Using `*` for Wildcard Matching

If you want to handle any path that matches a certain pattern, you can use the wildcard character `*`:

```typescript
// Define an OPTIONS route for CORS preflight checks.
app.options("/files/*filename", {
	allowedOrigins: ["http://example.com", "https://api.example.com"],
});

app.get("/files/*filename", (req, res) => {
	// Handle the request logic here
	const filename = req.params.filename;
	res.send(`File requested: ${filename}`);
});
```

### Example Combining Dynamic and CORS

Here’s a complete example that combines dynamic routes with CORS policy headers:

```typescript
const app = new toastiebun.server({
	cors: {
		allowedOrigins: ["http://example.com", "https://api.example.com"],
	},
});

// Define an OPTIONS route for CORS preflight checks on /users/:userId.
app.options("/users/:userId", {
	allowedOrigins: ["http://example.com", "https://api.example.com"],
});

// Define a GET route for dynamic paths.
app.get("/users/:userId", (req, res) => {
	// Handle the request logic here
	const userId = req.params.userId;
	res.send(`User with id: ${userId}`);
});

// Define an OPTIONS route for CORS preflight checks on '/files/*'.
app.options("/files/*", {
	allowedOrigins: ["http://example.com", "https://api.example.com"],
});

// Define a GET route for wildcard paths.
app.get("/files/*", (req, res) => {

	// Handle the request logic here...

});

app.listen("127.0.0.1", 3000, () => {
	console.log("Server is running on http://127.0.0.1:3000");
});
```

In this example, both dynamic and wildcard routes are defined with appropriate CORS headers to ensure proper handling of cross-origin requests. The server will
send the necessary headers during `OPTIONS` preflight checks.
