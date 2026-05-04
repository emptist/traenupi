import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class Promise<FEX> extends _.CustomType {
  /** @deprecated */
  constructor(state: PromiseState$<any>);
  /** @deprecated */
  state: PromiseState$<any>;
}
export function Promise$Promise<FEX>(state: PromiseState$<any>): Promise$<FEX>;
export function Promise$isPromise<FEX>(value: Promise$<FEX>): boolean;
export function Promise$Promise$0<FEX>(value: Promise$<FEX>): PromiseState$<any>;
export function Promise$Promise$state<FEX>(
  value: Promise$<FEX>,
): PromiseState$<any>;

export type Promise$<FEX> = Promise<FEX>;

export class Pending extends _.CustomType {}
export function PromiseState$Pending<FEY>(): PromiseState$<FEY>;
export function PromiseState$isPending<FEY>(value: PromiseState$<FEY>): boolean;

export class Fulfilled<FEY> extends _.CustomType {
  /** @deprecated */
  constructor(value: FEY);
  /** @deprecated */
  value: FEY;
}
export function PromiseState$Fulfilled<FEY>(value: FEY): PromiseState$<FEY>;
export function PromiseState$isFulfilled<FEY>(
  value: PromiseState$<FEY>,
): boolean;
export function PromiseState$Fulfilled$0<FEY>(value: PromiseState$<FEY>): FEY;
export function PromiseState$Fulfilled$value<FEY>(value: PromiseState$<FEY>): FEY;

export class Rejected extends _.CustomType {
  /** @deprecated */
  constructor(error: string);
  /** @deprecated */
  error: string;
}
export function PromiseState$Rejected<FEY>(error: string): PromiseState$<FEY>;
export function PromiseState$isRejected<FEY>(
  value: PromiseState$<FEY>,
): boolean;
export function PromiseState$Rejected$0<FEY>(value: PromiseState$<FEY>): string;
export function PromiseState$Rejected$error<FEY>(value: PromiseState$<FEY>): string;

export type PromiseState$<FEY> = Pending | Fulfilled<FEY> | Rejected;

export class Task<FEZ> extends _.CustomType {
  /** @deprecated */
  constructor(run: () => Promise$<any>);
  /** @deprecated */
  run: () => Promise$<any>;
}
export function Task$Task<FEZ>(run: () => Promise$<any>): Task$<FEZ>;
export function Task$isTask<FEZ>(value: Task$<FEZ>): boolean;
export function Task$Task$0<FEZ>(value: Task$<FEZ>): () => Promise$<any>;
export function Task$Task$run<FEZ>(value: Task$<FEZ>): () => Promise$<any>;

export type Task$<FEZ> = Task<FEZ>;

export function pending(): Promise$<any>;

export function fulfilled<FFC>(value: FFC): Promise$<FFC>;

export function rejected(error: string): Promise$<any>;

export function is_pending(promise: Promise$<any>): boolean;

export function is_fulfilled(promise: Promise$<any>): boolean;

export function is_rejected(promise: Promise$<any>): boolean;

export function is_settled(promise: Promise$<any>): boolean;

export function map<FFO, FFQ>(promise: Promise$<FFO>, f: (x0: FFO) => FFQ): Promise$<
  FFQ
>;

export function map_error<FFS>(
  promise: Promise$<FFS>,
  f: (x0: string) => string
): Promise$<FFS>;

export function then$<FFV, FFX>(
  promise: Promise$<FFV>,
  f: (x0: FFV) => Promise$<FFX>
): Promise$<FFX>;

export function recover<FGA>(
  promise: Promise$<FGA>,
  f: (x0: string) => Promise$<FGA>
): Promise$<FGA>;

export function get<FGE>(promise: Promise$<FGE>): $option.Option$<FGE>;

export function get_error(promise: Promise$<any>): $option.Option$<string>;

export function get_or_default<FGK>(promise: Promise$<FGK>, default$: FGK): FGK;

export function all<FGM>(promises: _.List<Promise$<FGM>>): Promise$<_.List<FGM>>;

export function race<FGR>(promises: _.List<Promise$<FGR>>): Promise$<FGR>;

export function resolve<FGV>(value: FGV): Promise$<FGV>;

export function reject(error: string): Promise$<any>;

export function from_result<FGZ>(result: _.Result<FGZ, string>): Promise$<FGZ>;

export function to_result<FHD>(promise: Promise$<FHD>): _.Result<FHD, string>;

export function state_to_string(promise: Promise$<any>): string;

export function task<FHJ>(run: () => Promise$<FHJ>): Task$<FHJ>;

export function run_task<FHM>(t: Task$<FHM>): Promise$<FHM>;

export function map_task<FHP, FHR>(t: Task$<FHP>, f: (x0: FHP) => FHR): Task$<
  FHR
>;

export function then_task<FHT, FHV>(t: Task$<FHT>, f: (x0: FHT) => Task$<FHV>): Task$<
  FHV
>;

export function sequence<FHY>(tasks: _.List<Task$<FHY>>): Task$<_.List<FHY>>;
