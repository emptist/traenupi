import type * as _ from "../../gleam.d.mts";

export type Array$<EOA> = any;

export function from_list<EOE>(a: _.List<EOE>): Array$<EOE>;

export function size(a: Array$<any>): number;

export function map<EOJ, EOL>(a: Array$<EOJ>, with$: (x0: EOJ) => EOL): Array$<
  EOL
>;

export function fold<EON, EOP>(
  over: Array$<EON>,
  from: EOP,
  with$: (x0: EOP, x1: EON) => EOP
): EOP;

export function fold_right<EOQ, EOS>(
  over: Array$<EOQ>,
  from: EOS,
  with$: (x0: EOS, x1: EOQ) => EOS
): EOS;

export function to_list<EOB>(items: Array$<EOB>): _.List<EOB>;

export function get<EOT>(a: Array$<EOT>, b: number): _.Result<EOT, undefined>;
