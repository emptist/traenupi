import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export function equal<EZX>(a: EZX, b: EZX): undefined;

export function not_equal<EZY>(a: EZY, b: EZY): undefined;

export function be_ok<EZZ>(a: _.Result<EZZ, any>): EZZ;

export function be_error<FAE>(a: _.Result<any, FAE>): FAE;

export function be_some<FAH>(a: $option.Option$<FAH>): FAH;

export function be_none(a: $option.Option$<any>): undefined;

export function be_true(actual: boolean): undefined;

export function be_false(actual: boolean): undefined;

export function fail(): undefined;
