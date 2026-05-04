import type * as _ from "../../gleam.d.mts";
import type * as $cookie from "../../gleam/http/cookie.d.mts";

export class Response<EHE> extends _.CustomType {
  /** @deprecated */
  constructor(status: number, headers: _.List<[string, string]>, body: EHE);
  /** @deprecated */
  status: number;
  /** @deprecated */
  headers: _.List<[string, string]>;
  /** @deprecated */
  body: EHE;
}
export function Response$Response<EHE>(
  status: number,
  headers: _.List<[string, string]>,
  body: EHE,
): Response$<EHE>;
export function Response$isResponse<EHE>(value: Response$<EHE>): boolean;
export function Response$Response$0<EHE>(value: Response$<EHE>): number;
export function Response$Response$status<EHE>(value: Response$<EHE>): number;
export function Response$Response$1<EHE>(value: Response$<EHE>): _.List<
  [string, string]
>;
export function Response$Response$headers<EHE>(value: Response$<EHE>): _.List<
  [string, string]
>;
export function Response$Response$2<EHE>(value: Response$<EHE>): EHE;
export function Response$Response$body<EHE>(value: Response$<EHE>): EHE;

export type Response$<EHE> = Response<EHE>;

export function new$(status: number): Response$<string>;

export function get_header(response: Response$<any>, key: string): _.Result<
  string,
  undefined
>;

export function set_header<EHT>(
  response: Response$<EHT>,
  key: string,
  value: string
): Response$<EHT>;

export function prepend_header<EHW>(
  response: Response$<EHW>,
  key: string,
  value: string
): Response$<EHW>;

export function set_body<EIB>(response: Response$<any>, body: EIB): Response$<
  EIB
>;

export function try_map<EHF, EHH, EHI>(
  response: Response$<EHF>,
  transform: (x0: EHF) => _.Result<EHH, EHI>
): _.Result<Response$<EHH>, EHI>;

export function map<EID, EIF>(
  response: Response$<EID>,
  transform: (x0: EID) => EIF
): Response$<EIF>;

export function redirect(uri: string): Response$<string>;

export function get_cookies(resp: Response$<any>): _.List<[string, string]>;

export function set_cookie<EIL>(
  response: Response$<EIL>,
  name: string,
  value: string,
  attributes: $cookie.Attributes$
): Response$<EIL>;

export function expire_cookie<EIO>(
  response: Response$<EIO>,
  name: string,
  attributes: $cookie.Attributes$
): Response$<EIO>;
