[toastiebun](../wiki/globals) / [toastiebun](../wiki/Namespace.toastiebun) / handlerFunction

# Type Alias: handlerFunction()

> **handlerFunction**: (`req`, `res`, `next`) => `any`

HTTP Handler Function

A handler function that modifies requests and responses as HTTP requests come in.
Handler functions have access to the request `req`, response `res`, and can call
the next handler in the stack `next()`.

## Parameters

• **req**: [`request`](../wiki/toastiebun.Interface.request)

The HTTP request object.

• **res**: [`response`](../wiki/toastiebun.Interface.response)

The HTTP response object to modify.

• **next**: [`nextFn`](../wiki/toastiebun.TypeAlias.nextFn)

The callback function to call the next Handler (if any).

## Returns

`any`

## Defined in

[toastiebun.d.ts:96](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L96)
