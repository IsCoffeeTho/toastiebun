[toastiebun](../wiki/globals) / [toastiebun](../wiki/Namespace.toastiebun) / server

# Interface: server

## See

[toastiebun.serverOptions](../wiki/toastiebun.TypeAlias.serverOptions)

## Example

```ts
const app = new toastiebun.server({
})
```

## Properties

### all

> **all**: [`catchDescriptor`](../wiki/toastiebun.TypeAlias.catchDescriptor)\<[`server`](../wiki/toastiebun.Interface.server)\>

#### Defined in

[toastiebun.d.ts:187](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L187)

***

### connect

> **connect**: [`catchDescriptor`](../wiki/toastiebun.TypeAlias.catchDescriptor)\<[`server`](../wiki/toastiebun.Interface.server)\>

#### Defined in

[toastiebun.d.ts:186](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L186)

***

### delete

> **delete**: [`catchDescriptor`](../wiki/toastiebun.TypeAlias.catchDescriptor)\<[`server`](../wiki/toastiebun.Interface.server)\>

#### Defined in

[toastiebun.d.ts:183](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L183)

***

### get

> **get**: [`catchDescriptor`](../wiki/toastiebun.TypeAlias.catchDescriptor)\<[`server`](../wiki/toastiebun.Interface.server)\>

#### Defined in

[toastiebun.d.ts:179](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L179)

***

### host

> **host**: `string`

#### Defined in

[toastiebun.d.ts:177](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L177)

***

### listen()

> **listen**: (`host`, `port`, `fn`?) => `boolean`

#### Parameters

• **host**: `string`

• **port**: `number`

• **fn?**

#### Returns

`boolean`

#### Defined in

[toastiebun.d.ts:191](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L191)

***

### options

> **options**: [`catchDescriptor`](../wiki/toastiebun.TypeAlias.catchDescriptor)\<[`server`](../wiki/toastiebun.Interface.server)\>

#### Defined in

[toastiebun.d.ts:184](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L184)

***

### patch

> **patch**: [`catchDescriptor`](../wiki/toastiebun.TypeAlias.catchDescriptor)\<[`server`](../wiki/toastiebun.Interface.server)\>

#### Defined in

[toastiebun.d.ts:182](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L182)

***

### port

> **port**: `number`

#### Defined in

[toastiebun.d.ts:178](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L178)

***

### post

> **post**: [`catchDescriptor`](../wiki/toastiebun.TypeAlias.catchDescriptor)\<[`server`](../wiki/toastiebun.Interface.server)\>

#### Defined in

[toastiebun.d.ts:180](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L180)

***

### put

> **put**: [`catchDescriptor`](../wiki/toastiebun.TypeAlias.catchDescriptor)\<[`server`](../wiki/toastiebun.Interface.server)\>

#### Defined in

[toastiebun.d.ts:181](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L181)

***

### trace

> **trace**: [`catchDescriptor`](../wiki/toastiebun.TypeAlias.catchDescriptor)\<[`server`](../wiki/toastiebun.Interface.server)\>

#### Defined in

[toastiebun.d.ts:185](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L185)

***

### trickleRequest()

> **trickleRequest**: (`req`, `res`, `next`) => `Promise`\<`boolean`\>

#### Parameters

• **req**: [`request`](../wiki/toastiebun.Interface.request)

• **res**: [`response`](../wiki/toastiebun.Interface.response)

• **next**: [`nextFn`](../wiki/toastiebun.TypeAlias.nextFn)

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[toastiebun.d.ts:190](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L190)

***

### use()

> **use**: (`path`, `middleware`?) => `this`

#### Parameters

• **path**: `string` \| `string`[] \| [`server`](../wiki/toastiebun.Interface.server)

• **middleware?**: [`server`](../wiki/toastiebun.Interface.server)

#### Returns

`this`

#### Defined in

[toastiebun.d.ts:189](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L189)

***

### websocket()

> **websocket**: (`path`, `websocketFunction`) => `this`

#### Parameters

• **path**: `string`

• **websocketFunction**

#### Returns

`this`

#### Defined in

[toastiebun.d.ts:188](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L188)
