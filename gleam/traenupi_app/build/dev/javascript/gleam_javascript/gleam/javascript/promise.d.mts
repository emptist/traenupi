import type * as $dynamic from "../../../gleam_stdlib/gleam/dynamic.d.mts";
import type * as _ from "../../gleam.d.mts";
import type * as $array from "../../gleam/javascript/array.d.mts";

export type Promise$<EPE> = any;

export function new$<EPF>(a: (x0: (x0: EPF) => undefined) => undefined): Promise$<
  EPF
>;

export function start<EPH>(): [Promise$<EPH>, (x0: EPH) => undefined];

export function resolve<EPJ>(a: EPJ): Promise$<EPJ>;

export function rescue<EPL>(a: Promise$<EPL>, b: (x0: $dynamic.Dynamic$) => EPL): Promise$<
  EPL
>;

export function await$<EPO, EPQ>(
  a: Promise$<EPO>,
  b: (x0: EPO) => Promise$<EPQ>
): Promise$<EPQ>;

export function map<EPT, EPV>(a: Promise$<EPT>, b: (x0: EPT) => EPV): Promise$<
  EPV
>;

export function tap<EPX>(promise: Promise$<EPX>, callback: (x0: EPX) => any): Promise$<
  EPX
>;

export function map_try<EQB, EQC, EQG>(
  promise: Promise$<_.Result<EQB, EQC>>,
  callback: (x0: EQB) => _.Result<EQG, EQC>
): Promise$<_.Result<EQG, EQC>>;

export function try_await<EQM, EQN, EQR>(
  promise: Promise$<_.Result<EQM, EQN>>,
  callback: (x0: EQM) => Promise$<_.Result<EQR, EQN>>
): Promise$<_.Result<EQR, EQN>>;

export function await_array<EQY>(a: $array.Array$<Promise$<EQY>>): Promise$<
  $array.Array$<EQY>
>;

export function await_list<ERD>(xs: _.List<Promise$<ERD>>): Promise$<
  _.List<ERD>
>;

export function race_list<ERN>(a: _.List<Promise$<ERN>>): Promise$<ERN>;

export function race_array<ERR>(a: $array.Array$<Promise$<ERR>>): Promise$<ERR>;

export function wait(delay: number): Promise$<undefined>;
