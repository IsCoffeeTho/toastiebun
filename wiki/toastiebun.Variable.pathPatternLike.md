[toastiebun](../wiki/globals) / [toastiebun](../wiki/Namespace.toastiebun) / pathPatternLike

# Variable: pathPatternLike

> `const` **pathPatternLike**: `RegExp`

Regular expression pattern to match HTTP request paths, with optional wildcard support.

This regex pattern is designed to identify and validate strings that resemble
paths used in HTTP requests. It includes characters commonly found in HTTP paths
such as letters, numbers, '/', '+', '-', '_', '.', URL-encoded characters like '%20',
and the '*' character, which serves as an optional wildcard to match the ends of strings.

## Defined in

[toastiebun.d.ts:44](https://github.com/IsCoffeeTho/toastiebun/blob/68db60f7ee85daa2fa2dfd3ba3c6e7fae88c338b/src/toastiebun.d.ts#L44)
