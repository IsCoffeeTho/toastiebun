[toastiebun](../wiki/globals) / [toastiebun](../wiki/Namespace.toastiebun) / websocket

# Interface: websocket

## Properties

### on

> **on**: [`eventHandler`](../wiki/toastiebun.TypeAlias.eventHandler)\<[`websocketEvents`](../wiki/toastiebun.Interface.websocketEvents)\>

#### Defined in

[toastiebun.d.ts:381](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L381)

***

### once

> **once**: [`eventHandler`](../wiki/toastiebun.TypeAlias.eventHandler)\<[`websocketEvents`](../wiki/toastiebun.Interface.websocketEvents)\>

#### Defined in

[toastiebun.d.ts:382](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L382)

## Methods

### close()

> **close**(`code`?, `reason`?): `void`

#### Parameters

• **code?**: `number`

• **reason?**: `string`

#### Returns

`void`

#### Defined in

[toastiebun.d.ts:384](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L384)

***

### send()

> **send**(`m`): `boolean`

#### Parameters

• **m**: `string` \| `Buffer` \| `Uint8Array`

#### Returns

`boolean`

#### Defined in

[toastiebun.d.ts:383](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L383)
