import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class Queue<GDJ> extends _.CustomType {
  /** @deprecated */
  constructor(in$: _.List<any>, out: _.List<any>);
  /** @deprecated */
  in$: _.List<any>;
  /** @deprecated */
  out: _.List<any>;
}
export function Queue$Queue<GDJ>(
  in$: _.List<any>,
  out: _.List<any>,
): Queue$<GDJ>;
export function Queue$isQueue<GDJ>(value: Queue$<GDJ>): boolean;
export function Queue$Queue$0<GDJ>(value: Queue$<GDJ>): _.List<any>;
export function Queue$Queue$in<GDJ>(value: Queue$<GDJ>): _.List<any>;
export function Queue$Queue$1<GDJ>(value: Queue$<GDJ>): _.List<any>;
export function Queue$Queue$out<GDJ>(value: Queue$<GDJ>): _.List<any>;

export type Queue$<GDJ> = Queue<GDJ>;

export class Stack<GDK> extends _.CustomType {
  /** @deprecated */
  constructor(items: _.List<any>);
  /** @deprecated */
  items: _.List<any>;
}
export function Stack$Stack<GDK>(items: _.List<any>): Stack$<GDK>;
export function Stack$isStack<GDK>(value: Stack$<GDK>): boolean;
export function Stack$Stack$0<GDK>(value: Stack$<GDK>): _.List<any>;
export function Stack$Stack$items<GDK>(value: Stack$<GDK>): _.List<any>;

export type Stack$<GDK> = Stack<GDK>;

export class Deque<GDL> extends _.CustomType {
  /** @deprecated */
  constructor(front: _.List<any>, back: _.List<any>);
  /** @deprecated */
  front: _.List<any>;
  /** @deprecated */
  back: _.List<any>;
}
export function Deque$Deque<GDL>(
  front: _.List<any>,
  back: _.List<any>,
): Deque$<GDL>;
export function Deque$isDeque<GDL>(value: Deque$<GDL>): boolean;
export function Deque$Deque$0<GDL>(value: Deque$<GDL>): _.List<any>;
export function Deque$Deque$front<GDL>(value: Deque$<GDL>): _.List<any>;
export function Deque$Deque$1<GDL>(value: Deque$<GDL>): _.List<any>;
export function Deque$Deque$back<GDL>(value: Deque$<GDL>): _.List<any>;

export type Deque$<GDL> = Deque<GDL>;

export function new_queue(): Queue$<any>;

export function queue_from_list<GDO>(lst: _.List<GDO>): Queue$<GDO>;

export function queue_to_list<GDR>(queue: Queue$<GDR>): _.List<GDR>;

export function enqueue<GDU>(queue: Queue$<GDU>, item: GDU): Queue$<GDU>;

export function dequeue<GDX>(queue: Queue$<GDX>): [
  $option.Option$<GDX>,
  Queue$<GDX>
];

export function queue_peek<GEB>(queue: Queue$<GEB>): $option.Option$<GEB>;

export function queue_length(queue: Queue$<any>): number;

export function queue_is_empty(queue: Queue$<any>): boolean;

export function queue_map<GEI, GEK>(queue: Queue$<GEI>, f: (x0: GEI) => GEK): Queue$<
  GEK
>;

export function queue_filter<GEM>(
  queue: Queue$<GEM>,
  predicate: (x0: GEM) => boolean
): Queue$<GEM>;

export function queue_fold<GEP, GER>(
  queue: Queue$<GEP>,
  acc: GER,
  f: (x0: GEP, x1: GER) => GER
): GER;

export function new_stack(): Stack$<any>;

export function stack_from_list<GEU>(lst: _.List<GEU>): Stack$<GEU>;

export function stack_to_list<GEX>(stack: Stack$<GEX>): _.List<GEX>;

export function push<GFA>(stack: Stack$<GFA>, item: GFA): Stack$<GFA>;

export function pop<GFD>(stack: Stack$<GFD>): [
  $option.Option$<GFD>,
  Stack$<GFD>
];

export function stack_peek<GFH>(stack: Stack$<GFH>): $option.Option$<GFH>;

export function stack_length(stack: Stack$<any>): number;

export function stack_is_empty(stack: Stack$<any>): boolean;

export function stack_map<GFO, GFQ>(stack: Stack$<GFO>, f: (x0: GFO) => GFQ): Stack$<
  GFQ
>;

export function stack_filter<GFS>(
  stack: Stack$<GFS>,
  predicate: (x0: GFS) => boolean
): Stack$<GFS>;

export function stack_fold<GFV, GFX>(
  stack: Stack$<GFV>,
  acc: GFX,
  f: (x0: GFV, x1: GFX) => GFX
): GFX;

export function stack_reverse<GFY>(stack: Stack$<GFY>): Stack$<GFY>;

export function new_deque(): Deque$<any>;

export function deque_from_list<GGD>(lst: _.List<GGD>): Deque$<GGD>;

export function deque_to_list<GGG>(deque: Deque$<GGG>): _.List<GGG>;

export function push_front<GGJ>(deque: Deque$<GGJ>, item: GGJ): Deque$<GGJ>;

export function push_back<GGM>(deque: Deque$<GGM>, item: GGM): Deque$<GGM>;

export function pop_front<GGP>(deque: Deque$<GGP>): [
  $option.Option$<GGP>,
  Deque$<GGP>
];

export function pop_back<GGT>(deque: Deque$<GGT>): [
  $option.Option$<GGT>,
  Deque$<GGT>
];

export function deque_peek_front<GGX>(deque: Deque$<GGX>): $option.Option$<GGX>;

export function deque_peek_back<GHA>(deque: Deque$<GHA>): $option.Option$<GHA>;

export function deque_length(deque: Deque$<any>): number;

export function deque_is_empty(deque: Deque$<any>): boolean;

export function deque_map<GHH, GHJ>(deque: Deque$<GHH>, f: (x0: GHH) => GHJ): Deque$<
  GHJ
>;

export function deque_filter<GHL>(
  deque: Deque$<GHL>,
  predicate: (x0: GHL) => boolean
): Deque$<GHL>;

export function deque_fold<GHO, GHQ>(
  deque: Deque$<GHO>,
  acc: GHQ,
  f: (x0: GHO, x1: GHQ) => GHQ
): GHQ;
