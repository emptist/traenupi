import type * as _ from "../gleam.d.mts";

export class Passed extends _.CustomType {}
export function PropertyResult$Passed(): PropertyResult$;
export function PropertyResult$isPassed(value: PropertyResult$): boolean;

export class Failed extends _.CustomType {
  /** @deprecated */
  constructor(counterexample: string);
  /** @deprecated */
  counterexample: string;
}
export function PropertyResult$Failed(counterexample: string): PropertyResult$;
export function PropertyResult$isFailed(value: PropertyResult$): boolean;
export function PropertyResult$Failed$0(value: PropertyResult$): string;
export function PropertyResult$Failed$counterexample(value: PropertyResult$): string;

export type PropertyResult$ = Passed | Failed;

export const default_num_tests: number;

export function for_all<KHK>(
  generator: (x0: number) => KHK,
  property: (x0: KHK) => boolean,
  num_tests: number
): PropertyResult$;

export function gen_int(seed: number): number;

export function gen_positive_int(seed: number): number;

export function gen_negative_int(seed: number): number;

export function gen_non_negative_int(seed: number): number;

export function gen_string(seed: number): string;

export function gen_non_empty_string(seed: number): string;

export function gen_list<KHN>(generator: (x0: number) => KHN, seed: number): _.List<
  KHN
>;

export function gen_bool(seed: number): boolean;

export function check(result: PropertyResult$): boolean;

export function result_to_string(result: PropertyResult$): string;
