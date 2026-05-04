/// <reference types="./identity.d.mts" />
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { Ok, CustomType as $CustomType } from "../gleam.mjs";
import { now } from "./identity_ffi.mjs";

export class Nezha extends $CustomType {}
export const AgentSource$Nezha = () => new Nezha();
export const AgentSource$isNezha = (value) => value instanceof Nezha;

export class Opencode extends $CustomType {}
export const AgentSource$Opencode = () => new Opencode();
export const AgentSource$isOpencode = (value) => value instanceof Opencode;

export class Trae extends $CustomType {}
export const AgentSource$Trae = () => new Trae();
export const AgentSource$isTrae = (value) => value instanceof Trae;

export class External extends $CustomType {}
export const AgentSource$External = () => new External();
export const AgentSource$isExternal = (value) => value instanceof External;

export class Mcp extends $CustomType {}
export const AgentSource$Mcp = () => new Mcp();
export const AgentSource$isMcp = (value) => value instanceof Mcp;

export class Unknown extends $CustomType {}
export const AgentSource$Unknown = () => new Unknown();
export const AgentSource$isUnknown = (value) => value instanceof Unknown;

export class AgentContext extends $CustomType {
  constructor(project, git_hash, machine_fingerprint, cwd, source, branch, session_id, inner, model) {
    super();
    this.project = project;
    this.git_hash = git_hash;
    this.machine_fingerprint = machine_fingerprint;
    this.cwd = cwd;
    this.source = source;
    this.branch = branch;
    this.session_id = session_id;
    this.inner = inner;
    this.model = model;
  }
}
export const AgentContext$AgentContext = (project, git_hash, machine_fingerprint, cwd, source, branch, session_id, inner, model) =>
  new AgentContext(project,
  git_hash,
  machine_fingerprint,
  cwd,
  source,
  branch,
  session_id,
  inner,
  model);
export const AgentContext$isAgentContext = (value) =>
  value instanceof AgentContext;
export const AgentContext$AgentContext$project = (value) => value.project;
export const AgentContext$AgentContext$0 = (value) => value.project;
export const AgentContext$AgentContext$git_hash = (value) => value.git_hash;
export const AgentContext$AgentContext$1 = (value) => value.git_hash;
export const AgentContext$AgentContext$machine_fingerprint = (value) =>
  value.machine_fingerprint;
export const AgentContext$AgentContext$2 = (value) => value.machine_fingerprint;
export const AgentContext$AgentContext$cwd = (value) => value.cwd;
export const AgentContext$AgentContext$3 = (value) => value.cwd;
export const AgentContext$AgentContext$source = (value) => value.source;
export const AgentContext$AgentContext$4 = (value) => value.source;
export const AgentContext$AgentContext$branch = (value) => value.branch;
export const AgentContext$AgentContext$5 = (value) => value.branch;
export const AgentContext$AgentContext$session_id = (value) => value.session_id;
export const AgentContext$AgentContext$6 = (value) => value.session_id;
export const AgentContext$AgentContext$inner = (value) => value.inner;
export const AgentContext$AgentContext$7 = (value) => value.inner;
export const AgentContext$AgentContext$model = (value) => value.model;
export const AgentContext$AgentContext$8 = (value) => value.model;

export class AgentIdentity extends $CustomType {
  constructor(id, project, git_hash, machine_fingerprint, created_at, display_name, description, source) {
    super();
    this.id = id;
    this.project = project;
    this.git_hash = git_hash;
    this.machine_fingerprint = machine_fingerprint;
    this.created_at = created_at;
    this.display_name = display_name;
    this.description = description;
    this.source = source;
  }
}
export const AgentIdentity$AgentIdentity = (id, project, git_hash, machine_fingerprint, created_at, display_name, description, source) =>
  new AgentIdentity(id,
  project,
  git_hash,
  machine_fingerprint,
  created_at,
  display_name,
  description,
  source);
export const AgentIdentity$isAgentIdentity = (value) =>
  value instanceof AgentIdentity;
export const AgentIdentity$AgentIdentity$id = (value) => value.id;
export const AgentIdentity$AgentIdentity$0 = (value) => value.id;
export const AgentIdentity$AgentIdentity$project = (value) => value.project;
export const AgentIdentity$AgentIdentity$1 = (value) => value.project;
export const AgentIdentity$AgentIdentity$git_hash = (value) => value.git_hash;
export const AgentIdentity$AgentIdentity$2 = (value) => value.git_hash;
export const AgentIdentity$AgentIdentity$machine_fingerprint = (value) =>
  value.machine_fingerprint;
export const AgentIdentity$AgentIdentity$3 = (value) =>
  value.machine_fingerprint;
export const AgentIdentity$AgentIdentity$created_at = (value) =>
  value.created_at;
export const AgentIdentity$AgentIdentity$4 = (value) => value.created_at;
export const AgentIdentity$AgentIdentity$display_name = (value) =>
  value.display_name;
export const AgentIdentity$AgentIdentity$5 = (value) => value.display_name;
export const AgentIdentity$AgentIdentity$description = (value) =>
  value.description;
export const AgentIdentity$AgentIdentity$6 = (value) => value.description;
export const AgentIdentity$AgentIdentity$source = (value) => value.source;
export const AgentIdentity$AgentIdentity$7 = (value) => value.source;

export class IdentityStore extends $CustomType {
  constructor(identities) {
    super();
    this.identities = identities;
  }
}
export const IdentityStore$IdentityStore = (identities) =>
  new IdentityStore(identities);
export const IdentityStore$isIdentityStore = (value) =>
  value instanceof IdentityStore;
export const IdentityStore$IdentityStore$identities = (value) =>
  value.identities;
export const IdentityStore$IdentityStore$0 = (value) => value.identities;

export function new_store() {
  return new IdentityStore($dict.new$());
}

export function new_context(cwd, machine_fingerprint) {
  return new AgentContext(
    new None(),
    new None(),
    machine_fingerprint,
    cwd,
    new Unknown(),
    new None(),
    new None(),
    false,
    new None(),
  );
}

export function with_project(context, project) {
  return new AgentContext(
    new Some(project),
    context.git_hash,
    context.machine_fingerprint,
    context.cwd,
    context.source,
    context.branch,
    context.session_id,
    context.inner,
    context.model,
  );
}

export function with_git_hash(context, hash) {
  return new AgentContext(
    context.project,
    new Some(hash),
    context.machine_fingerprint,
    context.cwd,
    context.source,
    context.branch,
    context.session_id,
    context.inner,
    context.model,
  );
}

export function with_source(context, source) {
  return new AgentContext(
    context.project,
    context.git_hash,
    context.machine_fingerprint,
    context.cwd,
    source,
    context.branch,
    context.session_id,
    context.inner,
    context.model,
  );
}

export function with_branch(context, branch) {
  return new AgentContext(
    context.project,
    context.git_hash,
    context.machine_fingerprint,
    context.cwd,
    context.source,
    new Some(branch),
    context.session_id,
    context.inner,
    context.model,
  );
}

export function with_session(context, session_id) {
  return new AgentContext(
    context.project,
    context.git_hash,
    context.machine_fingerprint,
    context.cwd,
    context.source,
    context.branch,
    new Some(session_id),
    context.inner,
    context.model,
  );
}

export function with_inner(context, model) {
  return new AgentContext(
    context.project,
    context.git_hash,
    context.machine_fingerprint,
    context.cwd,
    context.source,
    context.branch,
    context.session_id,
    true,
    new Some(model),
  );
}

export function store_identity(store, identity) {
  return new IdentityStore(
    $dict.insert(store.identities, identity.id, identity),
  );
}

export function get_identity(store, id) {
  let $ = $dict.get(store.identities, id);
  if ($ instanceof Ok) {
    let identity = $[0];
    return new Some(identity);
  } else {
    return new None();
  }
}

export function list_identities(store) {
  return $dict.values(store.identities);
}

export function get_identities_by_project(store, project) {
  let _pipe = store.identities;
  let _pipe$1 = $dict.values(_pipe);
  return $list.filter(
    _pipe$1,
    (identity) => {
      let $ = identity.project;
      if ($ instanceof Some) {
        let p = $[0];
        return p === project;
      } else {
        return false;
      }
    },
  );
}

export function count_identities(store) {
  return $dict.size(store.identities);
}

export function source_to_string(source) {
  if (source instanceof Nezha) {
    return "nezha";
  } else if (source instanceof Opencode) {
    return "opencode";
  } else if (source instanceof Trae) {
    return "trae";
  } else if (source instanceof External) {
    return "external";
  } else if (source instanceof Mcp) {
    return "mcp";
  } else {
    return "unknown";
  }
}

export function generate_semantic_id(context) {
  let source = source_to_string(context.source);
  let $ = context.inner;
  let $1 = context.project;
  let $2 = context.session_id;
  if ($) {
    if ($1 instanceof Some) {
      if ($2 instanceof Some) {
        let project = $1[0];
        let session_id = $2[0];
        let $3 = context.model;
        if ($3 instanceof Some) {
          let model = $3[0];
          return (((("I-" + model) + "-") + project) + "-") + session_id;
        } else {
          return (((("I-" + source) + "-") + project) + "-") + session_id;
        }
      } else {
        let project = $1[0];
        let $3 = context.model;
        if ($3 instanceof Some) {
          let model = $3[0];
          return (("I-" + model) + "-") + project;
        } else {
          return (("I-" + source) + "-") + project;
        }
      }
    } else if ($2 instanceof Some) {
      let session_id = $2[0];
      let $3 = context.model;
      if ($3 instanceof Some) {
        let model = $3[0];
        return (("I-" + model) + "-") + session_id;
      } else {
        return (("I-" + source) + "-") + session_id;
      }
    } else {
      let $3 = context.model;
      if ($3 instanceof Some) {
        let model = $3[0];
        return "I-" + model;
      } else {
        return "I-" + source;
      }
    }
  } else if ($1 instanceof Some) {
    if ($2 instanceof Some) {
      let project = $1[0];
      let session_id = $2[0];
      return (((("S-" + source) + "-") + project) + "-") + session_id;
    } else {
      let project = $1[0];
      return (("S-" + source) + "-") + project;
    }
  } else {
    let _block;
    let _pipe = context.cwd;
    let _pipe$1 = $string.split(_pipe, "/");
    let _pipe$2 = $list.reverse(_pipe$1);
    let _pipe$3 = $list.first(_pipe$2);
    let _pipe$4 = $option.from_result(_pipe$3);
    _block = $option.unwrap(_pipe$4, "unknown");
    let cwd_name = _block;
    return (((("G-" + source) + "-") + cwd_name) + "-") + context.machine_fingerprint;
  }
}

export function get_identities_by_source(store, source) {
  let source_str = source_to_string(source);
  let _pipe = store.identities;
  let _pipe$1 = $dict.values(_pipe);
  return $list.filter(
    _pipe$1,
    (identity) => {
      let $ = identity.source;
      if ($ instanceof Some) {
        let s = $[0];
        return s === source_str;
      } else {
        return false;
      }
    },
  );
}

export function source_from_string(str) {
  if (str === "nezha") {
    return new Nezha();
  } else if (str === "opencode") {
    return new Opencode();
  } else if (str === "trae") {
    return new Trae();
  } else if (str === "external") {
    return new External();
  } else if (str === "mcp") {
    return new Mcp();
  } else {
    return new Unknown();
  }
}

export function identity_to_json(identity) {
  let _block;
  let $ = identity.project;
  if ($ instanceof Some) {
    let p = $[0];
    _block = ("\"" + p) + "\"";
  } else {
    _block = "null";
  }
  let project_json = _block;
  let _block$1;
  let $1 = identity.source;
  if ($1 instanceof Some) {
    let s = $1[0];
    _block$1 = ("\"" + s) + "\"";
  } else {
    _block$1 = "null";
  }
  let source_json = _block$1;
  return ((((((("{\"id\":\"" + identity.id) + "\",\"project\":") + project_json) + ",\"source\":") + source_json) + ",\"created_at\":") + $int.to_string(
    identity.created_at,
  )) + "}";
}

function get_at(list, index) {
  let _pipe = list;
  let _pipe$1 = $list.drop(_pipe, index);
  let _pipe$2 = $list.first(_pipe$1);
  return $option.from_result(_pipe$2);
}

export function parse_identity_id(id) {
  let parts = $string.split(id, "-");
  let $ = $list.first(parts);
  if ($ instanceof Ok) {
    let $1 = $[0];
    if ($1 === "S") {
      let $2 = get_at(parts, 1);
      let $3 = get_at(parts, 2);
      if ($2 instanceof Some && $3 instanceof Some) {
        let source = $2[0];
        let project = $3[0];
        let _block;
        let $4 = get_at(parts, 3);
        if ($4 instanceof Some) {
          _block = $4;
        } else {
          _block = $4;
        }
        let session = _block;
        return new Some([source, project, session]);
      } else {
        return new None();
      }
    } else if ($1 === "G") {
      let $2 = get_at(parts, 1);
      let $3 = get_at(parts, 2);
      if ($2 instanceof Some && $3 instanceof Some) {
        let source = $2[0];
        let cwd_name = $3[0];
        return new Some([source, cwd_name, new None()]);
      } else {
        return new None();
      }
    } else if ($1 === "I") {
      let $2 = get_at(parts, 1);
      let $3 = get_at(parts, 2);
      if ($2 instanceof Some) {
        if ($3 instanceof Some) {
          let model_or_source = $2[0];
          let project_or_session = $3[0];
          let _block;
          let $4 = get_at(parts, 3);
          if ($4 instanceof Some) {
            _block = $4;
          } else {
            _block = $4;
          }
          let session = _block;
          return new Some([model_or_source, project_or_session, session]);
        } else {
          let model_or_source = $2[0];
          return new Some([model_or_source, "", new None()]);
        }
      } else {
        return new None();
      }
    } else {
      return new None();
    }
  } else {
    return new None();
  }
}

export function is_session_identity(id) {
  let $ = (() => {
    let _pipe = $string.split(id, "-");
    return $list.first(_pipe);
  })();
  if ($ instanceof Ok) {
    let $1 = $[0];
    if ($1 === "S") {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export function is_global_identity(id) {
  let $ = (() => {
    let _pipe = $string.split(id, "-");
    return $list.first(_pipe);
  })();
  if ($ instanceof Ok) {
    let $1 = $[0];
    if ($1 === "G") {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export function is_inner_identity(id) {
  let $ = (() => {
    let _pipe = $string.split(id, "-");
    return $list.first(_pipe);
  })();
  if ($ instanceof Ok) {
    let $1 = $[0];
    if ($1 === "I") {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export function create_identity(context) {
  return new AgentIdentity(
    generate_semantic_id(context),
    context.project,
    context.git_hash,
    new Some(context.machine_fingerprint),
    now(),
    new None(),
    new None(),
    new Some(source_to_string(context.source)),
  );
}
