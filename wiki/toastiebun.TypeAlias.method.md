[toastiebun](../wiki/globals) / [toastiebun](../wiki/Namespace.toastiebun) / method

# Type Alias: method

> **method**: `"GET"` \| `"POST"` \| `"PUT"` \| `"PATCH"` \| `"DELETE"` \| `"OPTIONS"` \| `"HEAD"` \| `"TRACE"` \| `"CONNECT"` \| `"*"` \| `"MIDDLEWARE"` \| `"WS"`

**`Internal`**

Represents HTTP methods commonly used in web development, including a catch all `"*"` and a `"MIDDLEWARE"` indicator
to express special handling

The `method` type represents standard HTTP methods as strings, such as:
- `"GET"`: The HTTP GET method retrieves data from the specified resource.
- `"POST"`: The HTTP POST method submits data to be processed to a specified resource.
- `"PUT"`: The HTTP PUT method updates a resource or creates one if it doesn't exist.
- `"DELETE"`: The HTTP DELETE method deletes a specified resource.
- `"PATCH"`: The HTTP PATCH method applies partial modifications to a resource.
- `"HEAD"`: The HTTP HEAD method retrieves headers of a specified resource without the body.
- `"OPTIONS"`: The HTTP OPTIONS method retrieves information about the communication options.

***as well as***
- `"*"`: Represents a wildcard that encompasses all HTTP methods.
- `"MIDDLEWARE"`: Represents a custom value for middleware handling, where a request is sent
to a sub-handler to modify or decorate it as it's being processed.

## Defined in

[toastiebun.d.ts:75](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L75)
