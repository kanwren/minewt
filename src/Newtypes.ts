const newtypeSymbol = Symbol();

/**
 * A 'type A = Newtype<N, T>' is like a type synonym 'type A = T', but it
 * creates a distinct type 'A' with the same runtime representation as 'T'. That
 * is, it is a compile error to use a value of type 'A' in place of a value of
 * type 'T' and vice-versa, but the type has no boxing overhead, as it only
 * exists at compile-time.
 *
 * In order to make a new newtype, declare it as follows:
 *
 *   type Int = Newtype<number, { readonly _: unique symbol; }>;
 *
 * This declares 'Int' as a distinct type with the same representation as
 * 'number'. In order to convert between the two types, you need an isomorphism:
 *
 *   // Make the newtype converter
 *   const Int: NewtypeWrapper<Int> = newtype();
 *
 *   // Wrap a 'number' into an 'Int'
 *   const anInt: Int = Int.wrap(3);
 *
 *   // Unwrap an 'Int' into a 'number'
 *   const aNumber: number = Int.unwrap(anInt);
 *
 *   // Error! Type 'number' is not assignable to type 'Int'
 *   const error: Int = aNumber;
 *
 * Using this strategy, the type and the converter can both have the same name.
 */
export interface Newtype<_T, N> {
    readonly [newtypeSymbol]: N;
}

/**
 * Extract the representation type 'T' from a 'Newtype<N, T>'.
 */
export type NewtypeRepr<N extends Newtype<any, any>> = N extends Newtype<infer T, any> ? T : never;

/**
 * The type of the converter returned by 'newtype'. Witnesses the isomorphism
 * between the newtype and its underlying type; that is, it encapsulates the
 * behavior to convert between the two types.
 */
export interface NewtypeWrapper<N extends Newtype<any, any>> {
    readonly unwrap: (wrapped: N) => NewtypeRepr<N>;
    readonly wrap: (bare: NewtypeRepr<N>) => N;
}

/**
 * Construct a 'NewtypeWrapper' isomorphism that is able to convert between a
 * newtype and its representation type.
 */
export function newtype<N extends Newtype<any, any>>(): NewtypeWrapper<N> {
    return {
        // Since the wrapper type only carries type information, unsafe coercion
        // is fine here
        unwrap: (x: N) => x as NewtypeRepr<N>,
        wrap: (x: NewtypeRepr<N>) => x as N,
    };
}

/**
 * Lift a function on a representation type to a function on a newtype that
 * wraps it.
 */
export function liftN<N extends Newtype<any, any> = never>(f: (x: NewtypeRepr<N>) => NewtypeRepr<N>): (x: N) => N {
    return f as unknown as (x: N) => N;
}

/**
 * Lift a function of two arguments on a representation type to a function on a
 * newtype that wraps it.
 */
export function liftN2<N extends Newtype<any, any> = never>(f: (x: NewtypeRepr<N>, y: NewtypeRepr<N>) => NewtypeRepr<N>): (x: N, y: N) => N {
    return f as unknown as (x: N, y: N) => N;
}

