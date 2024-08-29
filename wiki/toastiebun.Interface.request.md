[toastiebun](../wiki/globals) / [toastiebun](../wiki/Namespace.toastiebun) / request

# Interface: request

## Properties

### app

> `readonly` **app**: [`server`](../wiki/toastiebun.Interface.server)

Represents the toastiebun [server](../wiki/toastiebun.Interface.server) that is serving the request.

#### See

[server](../wiki/toastiebun.Interface.server)

#### Defined in

[toastiebun.d.ts:204](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L204)

***

### baseUrl

> `readonly` **baseUrl**: `string`

If the server has decided to delegate handling of a path to a middleware,
the parent path that caused the handle to capture will be available here.

#### See

[server.use](../wiki/toastiebun.Interface.server#use)

#### Defined in

[toastiebun.d.ts:212](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L212)

***

### cookies

> `readonly` **cookies**: `Map`\<`string`, `string` \| `boolean`\>

Magic Cookies that are sent with the client.

#### See

 - [https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie)
 - [https://en.wikipedia.org/wiki/Magic_cookie](https://en.wikipedia.org/wiki/Magic_cookie)

#### Defined in

[toastiebun.d.ts:228](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L228)

***

### data

> **data**: `any`

#### Defined in

[toastiebun.d.ts:333](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L333)

***

### fresh

> `readonly` **fresh**: `boolean`

Represents whether the clients cache should or shouldn't be updated

If `true`, the client is indicating that it may have the content requested in its cache

When a client sends the Cache-Control: no-cache request header to indicate an end-
to-end reload request. Further details for how cache validation works can be found in
the HTTP/1.1 Caching Specification [https://tools.ietf.org/html/rfc7234](https://tools.ietf.org/html/rfc7234).

#### See

[stale](../wiki/toastiebun.Interface.request#stale)

#### Defined in

[toastiebun.d.ts:240](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L240)

***

### headers

> **headers**: `Headers`

HTTP Headers of the request.

#### See

[https://datatracker.ietf.org/doc/html/rfc2616#autoid-33](https://datatracker.ietf.org/doc/html/rfc2616#autoid-33)

#### Defined in

[toastiebun.d.ts:312](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L312)

***

### hostname

> `readonly` **hostname**: `string`

Provided hostname of the request. Not garunteed to be accurate, but is provided using the
`Host` header in the HTTP request

#### Defined in

[toastiebun.d.ts:258](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L258)

***

### ip

> `readonly` **ip**: `string`

Internet Protocal Address of the request.

#### Defined in

[toastiebun.d.ts:264](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L264)

***

### json()

> **json**: () => `Promise`\<`unknown`\>

Returns json as a promise

#### Returns

`Promise`\<`unknown`\>

#### Example

```ts
const body = await req.json()
console.log(json);
```

#### Defined in

[toastiebun.d.ts:330](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L330)

***

### method

> `readonly` **method**: [`method`](../wiki/toastiebun.TypeAlias.method)

Current HTTP Method of request.

#### Defined in

[toastiebun.d.ts:269](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L269)

***

### originalUrl

> `readonly` **originalUrl**: `string`

#### Defined in

[toastiebun.d.ts:270](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L270)

***

### params

> `readonly` **params**: `object`

Search parameters of the request (if any)

#### Index Signature

 \[`key`: `string`\]: `string`

#### Example

```ts
'/users/:id' -> '/users/a0b1c2d3e4f5g6h7i8j9'
// would result in a 'params' with:
`{"id":"a0b1c2d3e4f5g6h7i8j9"}`
```

#### Defined in

[toastiebun.d.ts:286](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L286)

***

### path

> **path**: `string`

Provides the current path of the request.

#### See

[server.use](../wiki/toastiebun.Interface.server#use)

#### Defined in

[toastiebun.d.ts:305](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L305)

***

### query

> `readonly` **query**: `URLSearchParams`

Search query of the request (if any)

#### Example

```ts
'/users/search?name=john'
// would result in a 'query' with:
`{"name":"john"}`
```

#### Defined in

[toastiebun.d.ts:298](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L298)

***

### res

> `readonly` **res**: [`response`](../wiki/toastiebun.Interface.response)

The linked Response of the request.

#### See

[response](../wiki/toastiebun.Interface.response)

#### Defined in

[toastiebun.d.ts:276](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L276)

***

### routeStack

> `readonly` **routeStack**: [`handleDescriptor`](../wiki/toastiebun.TypeAlias.handleDescriptor)[]

Holds the previous request handlers that has modified or handled the current
request prioir.

#### See

 - [server.all](../wiki/toastiebun.Interface.server#all)
 - [server.use](../wiki/toastiebun.Interface.server#use)

#### Defined in

[toastiebun.d.ts:221](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L221)

***

### routeTrace()

> **routeTrace**: () => `string`[]

#### Returns

`string`[]

#### Defined in

[toastiebun.d.ts:331](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L331)

***

### stale

> `readonly` **stale**: `boolean`

Represents whether the clients cache should or shouldn't be updated

If `true`, the client is indicating that it may have content in its cache that is out of date

When a client sends the Cache-Control: no-cache request header to indicate an end-
to-end reload request. Further details for how cache validation works can be found in
the HTTP/1.1 Caching Specification [https://tools.ietf.org/html/rfc7234](https://tools.ietf.org/html/rfc7234).

#### See

[fresh](../wiki/toastiebun.Interface.request#fresh)

#### Defined in

[toastiebun.d.ts:252](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L252)

***

### text()

> **text**: () => `Promise`\<`string`\>

Returns text as a promise.

#### Returns

`Promise`\<`string`\>

#### Example

```ts
const body = await req.text()
console.log(body);
```

#### Defined in

[toastiebun.d.ts:321](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L321)

***

### upgrade()

> **upgrade**: (`serve`, `handler`) => [`websocket`](../wiki/toastiebun.Interface.websocket)

#### Parameters

• **serve**: `Server`

• **handler**: [`websocketHandler`](../wiki/toastiebun.TypeAlias.websocketHandler)

#### Returns

[`websocket`](../wiki/toastiebun.Interface.websocket)

#### Defined in

[toastiebun.d.ts:332](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L332)
