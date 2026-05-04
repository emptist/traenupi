import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export function option_to_result<KQK, KQM>(opt: $option.Option$<KQK>, err: KQM): _.Result<
  KQK,
  KQM
>;

export function result_to_option<KQP>(res: _.Result<KQP, any>): $option.Option$<
  KQP
>;

export function is_ok(res: _.Result<any, any>): boolean;

export function is_error(res: _.Result<any, any>): boolean;

export function is_some(opt: $option.Option$<any>): boolean;

export function is_none(opt: $option.Option$<any>): boolean;

export function get_or_else<KRG>(opt: $option.Option$<KRG>, default$: () => KRG): KRG;

export function get_or_default<KRI>(opt: $option.Option$<KRI>, default$: KRI): KRI;

export function unwrap_or_else<KRK, KRL>(
  res: _.Result<KRK, KRL>,
  or_else: (x0: KRL) => KRK
): KRK;

export function unwrap_or_default<KRO>(res: _.Result<KRO, any>, default$: KRO): KRO;

export function map_both<KRS, KRT, KRW, KRX>(
  res: _.Result<KRS, KRT>,
  on_ok: (x0: KRS) => KRW,
  on_error: (x0: KRT) => KRX
): _.Result<KRW, KRX>;

export function map_option<KSA, KSC>(
  opt: $option.Option$<KSA>,
  f: (x0: KSA) => KSC
): $option.Option$<KSC>;

export function filter_option<KSE>(
  opt: $option.Option$<KSE>,
  predicate: (x0: KSE) => boolean
): $option.Option$<KSE>;

export function filter_result<KSH, KSI>(
  res: _.Result<KSH, KSI>,
  predicate: (x0: KSH) => boolean,
  err: KSI
): _.Result<KSH, KSI>;

export function flatten_option<KSN>(opt: $option.Option$<$option.Option$<KSN>>): $option.Option$<
  KSN
>;

export function flatten_result<KSR, KSS>(res: _.Result<_.Result<KSR, KSS>, KSS>): _.Result<
  KSR,
  KSS
>;

export function partition_results<KSZ, KTA>(results: _.List<_.Result<KSZ, KTA>>): [
  _.List<KSZ>,
  _.List<KTA>
];

export function partition_options<KTG>(opts: _.List<$option.Option$<KTG>>): [
  _.List<KTG>,
  number
];

export function first_ok<KTK>(results: _.List<_.Result<KTK, any>>): $option.Option$<
  KTK
>;

export function first_some<KTQ>(opts: _.List<$option.Option$<KTQ>>): $option.Option$<
  KTQ
>;

export function all_ok<KTU, KTV>(results: _.List<_.Result<KTU, KTV>>): _.Result<
  _.List<KTU>,
  KTV
>;

export function all_some<KUC>(opts: _.List<$option.Option$<KUC>>): $option.Option$<
  _.List<KUC>
>;

export function or_else<KUH>(
  opt: $option.Option$<KUH>,
  alternative: () => $option.Option$<KUH>
): $option.Option$<KUH>;

export function or_else_result<KUL, KUM>(
  res: _.Result<KUL, KUM>,
  alternative: () => _.Result<KUL, KUM>
): _.Result<KUL, KUM>;

export function and_then<KUT, KUV>(
  opt: $option.Option$<KUT>,
  then_fn: (x0: KUT) => $option.Option$<KUV>
): $option.Option$<KUV>;

export function zip<KUY, KVA>(
  opt1: $option.Option$<KUY>,
  opt2: $option.Option$<KVA>
): $option.Option$<[KUY, KVA]>;

export function zip_result<KVD, KVE, KVH>(
  res1: _.Result<KVD, KVE>,
  res2: _.Result<KVH, KVE>
): _.Result<[KVD, KVH], KVE>;

export function contains<KVM>(opt: $option.Option$<KVM>, value: KVM): boolean;

export function contains_ok<KVO>(res: _.Result<KVO, any>, value: KVO): boolean;

export function contains_error<KVT>(res: _.Result<any, KVT>, err: KVT): boolean;

export function ok<KVW>(res: _.Result<KVW, any>): $option.Option$<KVW>;

export function err<KWC>(res: _.Result<any, KWC>): $option.Option$<KWC>;

export function transpose_option_result<KWG, KWH>(
  opt: $option.Option$<_.Result<KWG, KWH>>
): _.Result<$option.Option$<KWG>, KWH>;

export function transpose_result_option<KWO, KWQ>(
  res: _.Result<$option.Option$<KWO>, KWQ>
): $option.Option$<_.Result<KWO, KWQ>>;

export function fold_ok<KWW, KXA>(
  res: _.Result<KWW, any>,
  default$: KXA,
  f: (x0: KWW, x1: KXA) => KXA
): KXA;

export function fold_option<KXB, KXD>(
  opt: $option.Option$<KXB>,
  default$: KXD,
  f: (x0: KXB, x1: KXD) => KXD
): KXD;
