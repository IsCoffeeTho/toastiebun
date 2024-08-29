[toastiebun](../wiki/globals) / [toastiebun](../wiki/Namespace.toastiebun) / response

# Interface: response

## Properties

### app

> `readonly` **app**: [`server`](../wiki/toastiebun.Interface.server)

#### Defined in

[toastiebun.d.ts:351](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L351)

***

### append()

> **append**: (`field`, `value`?) => `this`

#### Parameters

• **field**: `string`

• **value?**: `string` \| `string`[]

#### Returns

`this`

#### Defined in

[toastiebun.d.ts:356](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L356)

***

### clearCookie()

> **clearCookie**: (`name`, `options`?) => `this`

#### Parameters

• **name**: `string`

• **options?**: [`cookieOptions`](../wiki/toastiebun.TypeAlias.cookieOptions)

#### Returns

`this`

#### Defined in

[toastiebun.d.ts:358](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L358)

***

### cookie()

> **cookie**: (`name`, `value`, `options`?) => `this`

#### Parameters

• **name**: `string`

• **value**: `any`

• **options?**: [`cookieOptions`](../wiki/toastiebun.TypeAlias.cookieOptions)

#### Returns

`this`

#### Defined in

[toastiebun.d.ts:357](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L357)

***

### end()

> **end**: () => `boolean`

#### Returns

`boolean`

#### Defined in

[toastiebun.d.ts:360](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L360)

***

### get()

> **get**: (`field`) => `null` \| `string` \| `string`[]

#### Parameters

• **field**: `string`

#### Returns

`null` \| `string` \| `string`[]

#### Defined in

[toastiebun.d.ts:361](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L361)

***

### headerSent

> `readonly` **headerSent**: `boolean`

#### Defined in

[toastiebun.d.ts:352](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L352)

***

### locals

> **locals**: `object`

#### Index Signature

 \[`key`: `string`\]: `string`

#### Defined in

[toastiebun.d.ts:353](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L353)

***

### markNoCache()

> **markNoCache**: () => `this`

#### Returns

`this`

#### Defined in

[toastiebun.d.ts:359](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L359)

***

### redirect()

> **redirect**: (`path`) => `boolean`

#### Parameters

• **path**: `string`

#### Returns

`boolean`

#### Defined in

[toastiebun.d.ts:362](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L362)

***

### send()

> **send**: (`body`) => `boolean`

#### Parameters

• **body**: `any`

#### Returns

`boolean`

#### Defined in

[toastiebun.d.ts:365](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L365)

***

### sendFile()

> **sendFile**: (`path`, `errCallback`?) => `boolean`

#### Parameters

• **path**: `string`

• **errCallback?**

#### Returns

`boolean`

#### Defined in

[toastiebun.d.ts:366](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L366)

***

### sendStatic()

> **sendStatic**: (`path`, `errCallback`?) => `boolean`

#### Parameters

• **path**: `string`

• **errCallback?**

#### Returns

`boolean`

#### Defined in

[toastiebun.d.ts:367](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L367)

***

### status()

> **status**: (`code`) => `this`

#### Parameters

• **code**: [`httpStatus`](../wiki/toastiebun.TypeAlias.httpStatus)

#### Returns

`this`

#### Defined in

[toastiebun.d.ts:364](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L364)

***

### type()

> **type**: (`type`) => `this`

#### Parameters

• **type**: `string`

#### Returns

`this`

#### Defined in

[toastiebun.d.ts:363](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L363)
