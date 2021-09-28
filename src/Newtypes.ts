declare const newtypeSymbol: unique symbol;

/**
 * A 'type A = Newtype<N, T>' is like a type synonym 'type A = T', but it
 * creates a distinct type 'A' with the same runtime representation as 'T'. That
 * is, it is a compile error to use a value of type 'A' in place of a value of
 * type 'T' and vice-versa, but the type has no boxing overhead, as it only
 * exists at compile-time.
 *
 * In order to make a new newtype, declare it as follows:
 *
 * <pre><code>
 * type Int = Newtype<number, { readonly _: unique symbol; }>;
 * </code></pre>
 *
 * This declares 'Int' as a distinct type with the same representation as
 * 'number'. In order to wrap values in this newtype, you need to make a
 * wrapper:
 *
 * <pre><code>
 * // Make the newtype wrapper
 * const Int = newtype<Int>();
 *
 * // Wrap a 'number' into an 'Int'
 * const anInt: Int = Int(3);
 *
 * // Unwrap an 'Int' into a 'number'
 * const aNumber: number = unwrap(anInt);
 *
 * // Error! Type 'number' is not assignable to type 'Int'
 * const error: Int = aNumber;
 * </code></pre>
 *
 * Using this strategy, the type and the wrapper can both have the same name.
 */
export interface Newtype<_T, N> {
    readonly [newtypeSymbol]: N;
    readonly _phantom: _T; // needed for generic newtypes
}

/**
 * Extract the representation type 'T' from a 'Newtype<N, T>'.
 */
export type NewtypeRepr<N extends Newtype<unknown, unknown>> = N extends Newtype<infer T, unknown> ? T : never;

/**
 * Returns a function that wraps a value of a representation type in a newtype.
 */
export function newtype<N extends Newtype<unknown, unknown> = never>(): (x: NewtypeRepr<N>) => N {
    return x => x as N;
}

/**
 * Unwrap a newtype, inferring the appropriate underlying type
 */
export function unwrap<N extends Newtype<unknown, unknown>>(x: N): NewtypeRepr<N> {
    return x as NewtypeRepr<N>;
}

/**
 * Lift a function on a representation type to a function on a newtype that
 * wraps it.
 */
export function liftN<N extends Newtype<unknown, unknown> = never>(f: (x: NewtypeRepr<N>) => NewtypeRepr<N>): (x: N) => N {
    return f as unknown as (x: N) => N;
}

/**
 * Lift a function of two arguments on a representation type to a function on a
 * newtype that wraps it.
 */
export function liftN2<N extends Newtype<unknown, unknown> = never>(f: (x: NewtypeRepr<N>, y: NewtypeRepr<N>) => NewtypeRepr<N>): (x: N, y: N) => N {
    return f as unknown as (x: N, y: N) => N;
}

