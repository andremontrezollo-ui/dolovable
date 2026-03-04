/**
 * Base Policy Pattern
 * 
 * Policies encapsulate complex business rules as pure, testable objects.
 * They must NOT depend on infrastructure or I/O.
 */

/** A policy that evaluates a condition */
export interface Policy<TInput, TResult = boolean> {
  evaluate(input: TInput): TResult;
}

/** A policy that can explain its decision */
export interface ExplainablePolicy<TInput, TResult = boolean> extends Policy<TInput, TResult> {
  explain(input: TInput): string;
}
