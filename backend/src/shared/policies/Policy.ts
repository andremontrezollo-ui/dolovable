/**
 * Base Policy Pattern
 * 
 * Policies encapsulate complex business rules as pure, testable objects.
 */

export interface Policy<TInput, TResult = boolean> {
  evaluate(input: TInput): TResult;
}
