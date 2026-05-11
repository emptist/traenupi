import { Ok, Error as GleamError, NonEmpty, Empty } from "../prelude.mjs";
import { Some, None } from "../gleam_stdlib/gleam/option.mjs";

export async function fetch(method, url, headers, body) {
  try {
    const headerObj = {};
    let current = headers;
    while (current instanceof NonEmpty) {
      const pair = current.head;
      if (Array.isArray(pair) && pair.length === 2) {
        headerObj[pair[0]] = pair[1];
      }
      current = current.tail;
    }

    const fetchOptions = {
      method: method,
      headers: headerObj,
    };

    if (body instanceof Some) {
      fetchOptions.body = body[0];
    }

    const response = await globalThis.fetch(url, fetchOptions);
    const text = await response.text();

    return new Ok({ status: response.status, body: text });
  } catch (error) {
    const errorMsg = error.message || error.toString() || "Network request failed";
    return new GleamError(errorMsg);
  }
}
