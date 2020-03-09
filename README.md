# minewt

A tiny newtype implementation for TypeScript.

Thanks to [MayMoonsley](https://github.com/MayMoonsley) for the very punny name
:3

## Motivation

Type aliases are a very common tool in TypeScript for type abstraction. They
make it easy to assign names to more complex types, and can even be used for
some degree of type-level programming. However, sometimes, something like the
following crops up:

```typescript
type Dollars = number;
```

The name `Dollars` is now an _alias_ for `number`; now, instead of writing
`pay(amount: number)`, we can write `pay(amount: Dollars)`. However, this does
not create a new type; it is not a compile error to pass in any old number into
`pay`. At best, it serves as documentation for programmers reading the code, but
it doesn't provide any type safety.

Another approach is to take the Java route, and make a new object to wrap
numbers:

```typescript
class Dollars {
    constructor(public readonly amount: number) {}
}
```

Now, we can convert to this new type via the constructor and field:

```typescript
const dollars: Dollars = new Dollars(3);
const amount: number = dollars.amount;
```

This has the type safety we want; `Dollars` is a distinct type from `number`!
Unfortunately, this creates a new object for every `Dollars` we have, and incurs
a boxing penalty. What we really want is to create a type with the same _runtime
representation_ as `number`, but create it as a distinct type, with neither
assignable to the other.

A **newtype** is the best of both worlds. A newtype:

* is a distinct type from its underlying type
* has the same runtime representation as its underlying type

## Usage

To create the type and the converter:

```typescript
// Create the newtype itself
type Dollars = Newtype<number, { readonly _: unique symbol; }>;

// Create the converter to and from the newtype
const Dollars = newtype<Dollars>();
```

Using the converter:

```typescript
// Wrap underlying type in newtype
const dollars: Dollars = Dollars(3);
// Unwrap newtype into underlying type
const amount: number = Dollars.unwrap(dollars);

// A newtype creates a distinct type:
const x: Dollars = 3; // Error! Type '3' is not assignable to type 'Dollars'
```

To query the underlying representation type, use `NewtypeRepr`:

```typescript
NewtypeRepr<Dollars> // 'number'
```

You can also lift functions over the underlying type to functions over the
wrapped type using `liftN` and `liftN2` (higher-arity lifting functions are easy
to define if necessary):

```typescript
function add(x: number, y: number): number {
    return x + y;
}

const x: Dollars = ...;
const y: Dollars = ...;

const addDollars = liftN2<Dollars>(add);

const sum = addDollars(x, y);
```

