# minewt

![Travis CI badge](https://travis-ci.com/nprindle/minewt.svg?branch=master)

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

Now, we can convert to and from this new type via the constructor and field:

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

After compilation, a newtype will be exactly the same as its underlying type;
all values of type `Dollars` will be `number`s at runtime. It's safe to cast
between the two, since they have exactly the same representation. This makes
newtypes a kind of _zero-cost abstraction_.

## Usage

To create the type and the wrapper:

```typescript
// Create the newtype itself
type Dollars = Newtype<number, { readonly _: unique symbol; }>;

// Create the newtype wrapper function
const Dollars = newtype<Dollars>();
```

To wrap and unwrap values:

```typescript
// Wrap underlying type in newtype
const dollars: Dollars = Dollars(3);
// Unwrap newtype into underlying type
const amount: number = unwrap(dollars);

// A newtype creates a distinct type:
const x: Dollars = 3; // Error! Type '3' is not assignable to type 'Dollars'
```

To query the underlying representation type, use `NewtypeRepr`:

```typescript
type T = NewtypeRepr<Dollars>; // 'number'
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

It's even possible to make newtypes that are assignable to other newtypes, using
intersection types with `&`:

```typescript
type A = Newtype<number, { readonly _: unique symbol; }>;
const A = newtype<A>();

// B extends A
type B = Newtype<number, { readonly _: unique symbol; }> & A;
const B = newtype<B>();

const x: A = A(0); // okay
const y: A = B(0); // okay
const z: B = A(0); // compile error: Type 'A' is not assignable to type 'B'
```

## Comparisons and Alternatives

`minewt` is very lightweight, and doesn't provide any specific newtype
implementations.

### Other newtype implementations

* [newtype-ts](https://github.com/gcantl/newtype-ts): uses a similar approach,
  but heavier weight, as it's tightly integrated with functional optics as
  part of the fp-ts community

### Other solutions

Another solution is to use **tag types**, which are a different zero-cost
abstraction with a somewhat similar purpose to newtypes. You can use tag types
to add information to a type, such as refinement information:

```typescript
function isEmail(str: string): str is string & Email {
    // ...
}
```

Multiple tags can also be added to a single type. In contrast to newtypes, tag
types have a slightly different goal. Tag types are mostly geared towards
validation, like the example above, and adding tags is mostly done via type
predicates. Tags can generally be added to any type.

Some neat libraries that implement tag types:

* [taghiro](https://github.com/sveseme/taghiro): implements tag types, and also
  ships with many useful tags

