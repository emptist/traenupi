/// <reference types="./cli.d.mts" />
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { Ok, Error, Empty as $Empty, CustomType as $CustomType } from "../gleam.mjs";

export class Help extends $CustomType {}
export const CliCommand$Help = () => new Help();
export const CliCommand$isHelp = (value) => value instanceof Help;

export class Version extends $CustomType {}
export const CliCommand$Version = () => new Version();
export const CliCommand$isVersion = (value) => value instanceof Version;

export class Status extends $CustomType {}
export const CliCommand$Status = () => new Status();
export const CliCommand$isStatus = (value) => value instanceof Status;

export class Tellme extends $CustomType {
  constructor(question) {
    super();
    this.question = question;
  }
}
export const CliCommand$Tellme = (question) => new Tellme(question);
export const CliCommand$isTellme = (value) => value instanceof Tellme;
export const CliCommand$Tellme$question = (value) => value.question;
export const CliCommand$Tellme$0 = (value) => value.question;

export class Know extends $CustomType {
  constructor(key, value) {
    super();
    this.key = key;
    this.value = value;
  }
}
export const CliCommand$Know = (key, value) => new Know(key, value);
export const CliCommand$isKnow = (value) => value instanceof Know;
export const CliCommand$Know$key = (value) => value.key;
export const CliCommand$Know$0 = (value) => value.key;
export const CliCommand$Know$value = (value) => value.value;
export const CliCommand$Know$1 = (value) => value.value;

export class Search extends $CustomType {
  constructor(query) {
    super();
    this.query = query;
  }
}
export const CliCommand$Search = (query) => new Search(query);
export const CliCommand$isSearch = (value) => value instanceof Search;
export const CliCommand$Search$query = (value) => value.query;
export const CliCommand$Search$0 = (value) => value.query;

export class Remind extends $CustomType {
  constructor(minutes, message) {
    super();
    this.minutes = minutes;
    this.message = message;
  }
}
export const CliCommand$Remind = (minutes, message) =>
  new Remind(minutes, message);
export const CliCommand$isRemind = (value) => value instanceof Remind;
export const CliCommand$Remind$minutes = (value) => value.minutes;
export const CliCommand$Remind$0 = (value) => value.minutes;
export const CliCommand$Remind$message = (value) => value.message;
export const CliCommand$Remind$1 = (value) => value.message;

export class Review extends $CustomType {
  constructor(review_id, action) {
    super();
    this.review_id = review_id;
    this.action = action;
  }
}
export const CliCommand$Review = (review_id, action) =>
  new Review(review_id, action);
export const CliCommand$isReview = (value) => value instanceof Review;
export const CliCommand$Review$review_id = (value) => value.review_id;
export const CliCommand$Review$0 = (value) => value.review_id;
export const CliCommand$Review$action = (value) => value.action;
export const CliCommand$Review$1 = (value) => value.action;

export class Tasks extends $CustomType {}
export const CliCommand$Tasks = () => new Tasks();
export const CliCommand$isTasks = (value) => value instanceof Tasks;

export class Unknown extends $CustomType {
  constructor(command, args) {
    super();
    this.command = command;
    this.args = args;
  }
}
export const CliCommand$Unknown = (command, args) => new Unknown(command, args);
export const CliCommand$isUnknown = (value) => value instanceof Unknown;
export const CliCommand$Unknown$command = (value) => value.command;
export const CliCommand$Unknown$0 = (value) => value.command;
export const CliCommand$Unknown$args = (value) => value.args;
export const CliCommand$Unknown$1 = (value) => value.args;

export class ParseOk extends $CustomType {
  constructor(command) {
    super();
    this.command = command;
  }
}
export const ParseResult$ParseOk = (command) => new ParseOk(command);
export const ParseResult$isParseOk = (value) => value instanceof ParseOk;
export const ParseResult$ParseOk$command = (value) => value.command;
export const ParseResult$ParseOk$0 = (value) => value.command;

export class ParseError extends $CustomType {
  constructor(message) {
    super();
    this.message = message;
  }
}
export const ParseResult$ParseError = (message) => new ParseError(message);
export const ParseResult$isParseError = (value) => value instanceof ParseError;
export const ParseResult$ParseError$message = (value) => value.message;
export const ParseResult$ParseError$0 = (value) => value.message;

function parse_tellme(args) {
  if (args instanceof $Empty) {
    return new ParseError("tellme requires a question argument");
  } else {
    return new ParseOk(new Tellme($string.join(args, " ")));
  }
}

function parse_know(args) {
  if (args instanceof $Empty) {
    return new ParseError("know requires key and value arguments");
  } else {
    let key = args.head;
    let rest = args.tail;
    if (rest instanceof $Empty) {
      return new ParseError("know requires a value argument");
    } else {
      return new ParseOk(new Know(key, $string.join(rest, " ")));
    }
  }
}

function parse_search(args) {
  if (args instanceof $Empty) {
    return new ParseError("search requires a query argument");
  } else {
    return new ParseOk(new Search($string.join(args, " ")));
  }
}

function parse_review(args) {
  if (args instanceof $Empty) {
    return new ParseError("review requires a review_id argument");
  } else {
    let $ = args.tail;
    if ($ instanceof $Empty) {
      let review_id = args.head;
      return new ParseOk(new Review(review_id, new None()));
    } else {
      let review_id = args.head;
      let action = $.head;
      return new ParseOk(new Review(review_id, new Some(action)));
    }
  }
}

function is_digit(s) {
  if (s === "0") {
    return true;
  } else if (s === "1") {
    return true;
  } else if (s === "2") {
    return true;
  } else if (s === "3") {
    return true;
  } else if (s === "4") {
    return true;
  } else if (s === "5") {
    return true;
  } else if (s === "6") {
    return true;
  } else if (s === "7") {
    return true;
  } else if (s === "8") {
    return true;
  } else if (s === "9") {
    return true;
  } else {
    return false;
  }
}

function digit_to_int(s) {
  if (s === "0") {
    return 0;
  } else if (s === "1") {
    return 1;
  } else if (s === "2") {
    return 2;
  } else if (s === "3") {
    return 3;
  } else if (s === "4") {
    return 4;
  } else if (s === "5") {
    return 5;
  } else if (s === "6") {
    return 6;
  } else if (s === "7") {
    return 7;
  } else if (s === "8") {
    return 8;
  } else if (s === "9") {
    return 9;
  } else {
    return 0;
  }
}

function int_parse(s) {
  if (s === "0") {
    return new Ok(0);
  } else if (s === "1") {
    return new Ok(1);
  } else if (s === "2") {
    return new Ok(2);
  } else if (s === "3") {
    return new Ok(3);
  } else if (s === "4") {
    return new Ok(4);
  } else if (s === "5") {
    return new Ok(5);
  } else if (s === "6") {
    return new Ok(6);
  } else if (s === "7") {
    return new Ok(7);
  } else if (s === "8") {
    return new Ok(8);
  } else if (s === "9") {
    return new Ok(9);
  } else if (s === "10") {
    return new Ok(10);
  } else if (s === "15") {
    return new Ok(15);
  } else if (s === "20") {
    return new Ok(20);
  } else if (s === "30") {
    return new Ok(30);
  } else if (s === "60") {
    return new Ok(60);
  } else {
    let $ = $string.starts_with(s, "-");
    if ($) {
      return new Error(undefined);
    } else {
      let $1 = $string.length(s) > 3;
      if ($1) {
        return new Error(undefined);
      } else {
        let chars = $string.to_graphemes(s);
        let $2 = $list.all(chars, (c) => { return is_digit(c); });
        if ($2) {
          let num = $list.fold(
            chars,
            0,
            (acc, c) => { return acc * 10 + digit_to_int(c); },
          );
          return new Ok(num);
        } else {
          return new Error(undefined);
        }
      }
    }
  }
}

function parse_remind(args) {
  if (args instanceof $Empty) {
    return new ParseError("remind requires minutes and message arguments");
  } else {
    let minutes_str = args.head;
    let rest = args.tail;
    let $ = int_parse(minutes_str);
    if ($ instanceof Ok) {
      let minutes = $[0];
      if (rest instanceof $Empty) {
        return new ParseError("remind requires a message argument");
      } else {
        return new ParseOk(new Remind(minutes, $string.join(rest, " ")));
      }
    } else {
      return new ParseError("remind: first argument must be a number (minutes)");
    }
  }
}

export function parse_args(args) {
  if (args instanceof $Empty) {
    return new ParseOk(new Help());
  } else {
    let $ = args.head;
    if ($ === "help") {
      return new ParseOk(new Help());
    } else if ($ === "--help") {
      return new ParseOk(new Help());
    } else if ($ === "-h") {
      return new ParseOk(new Help());
    } else if ($ === "version") {
      return new ParseOk(new Version());
    } else if ($ === "--version") {
      return new ParseOk(new Version());
    } else if ($ === "-v") {
      return new ParseOk(new Version());
    } else if ($ === "status") {
      return new ParseOk(new Status());
    } else if ($ === "tellme") {
      let rest = args.tail;
      return parse_tellme(rest);
    } else if ($ === "know") {
      let rest = args.tail;
      return parse_know(rest);
    } else if ($ === "search") {
      let rest = args.tail;
      return parse_search(rest);
    } else if ($ === "remind") {
      let rest = args.tail;
      return parse_remind(rest);
    } else if ($ === "review") {
      let rest = args.tail;
      return parse_review(rest);
    } else if ($ === "tasks") {
      return new ParseOk(new Tasks());
    } else {
      let cmd = $;
      let rest = args.tail;
      return new ParseOk(new Unknown(cmd, rest));
    }
  }
}

function int_to_string(n) {
  if (n === 0) {
    return "0";
  } else if (n === 1) {
    return "1";
  } else if (n === 2) {
    return "2";
  } else if (n === 3) {
    return "3";
  } else if (n === 4) {
    return "4";
  } else if (n === 5) {
    return "5";
  } else if (n === 6) {
    return "6";
  } else if (n === 7) {
    return "7";
  } else if (n === 8) {
    return "8";
  } else if (n === 9) {
    return "9";
  } else if (n === 10) {
    return "10";
  } else if (n === 15) {
    return "15";
  } else if (n === 20) {
    return "20";
  } else if (n === 30) {
    return "30";
  } else if (n === 60) {
    return "60";
  } else {
    return "0";
  }
}

export function command_to_string(cmd) {
  if (cmd instanceof Help) {
    return "help";
  } else if (cmd instanceof Version) {
    return "version";
  } else if (cmd instanceof Status) {
    return "status";
  } else if (cmd instanceof Tellme) {
    let question = cmd.question;
    return ("tellme \"" + question) + "\"";
  } else if (cmd instanceof Know) {
    let key = cmd.key;
    let value = cmd.value;
    return ((("know " + key) + " \"") + value) + "\"";
  } else if (cmd instanceof Search) {
    let query = cmd.query;
    return ("search \"" + query) + "\"";
  } else if (cmd instanceof Remind) {
    let minutes = cmd.minutes;
    let message = cmd.message;
    return ((("remind " + int_to_string(minutes)) + " \"") + message) + "\"";
  } else if (cmd instanceof Review) {
    let review_id = cmd.review_id;
    let action = cmd.action;
    if (action instanceof Some) {
      let a = action[0];
      return (("review " + review_id) + " ") + a;
    } else {
      return "review " + review_id;
    }
  } else if (cmd instanceof Tasks) {
    return "tasks";
  } else {
    let command = cmd.command;
    let args = cmd.args;
    return (("unknown: " + command) + " ") + $string.join(args, " ");
  }
}

export function is_valid_command(cmd) {
  if (cmd === "help") {
    return true;
  } else if (cmd === "version") {
    return true;
  } else if (cmd === "status") {
    return true;
  } else if (cmd === "tellme") {
    return true;
  } else if (cmd === "know") {
    return true;
  } else if (cmd === "search") {
    return true;
  } else if (cmd === "remind") {
    return true;
  } else if (cmd === "review") {
    return true;
  } else if (cmd === "tasks") {
    return true;
  } else {
    return false;
  }
}

export function get_help_text() {
  return "TraeNuPI CLI Commands:\n\n  help              Show this help message\n  version           Show version information\n  status            Show daemon status\n  tellme <question> Ask the baby AI a question\n  know <key> <val>  Store knowledge in the database\n  search <query>    Search the web\n  remind <min> <msg> Set a reminder\n  review <id> [act] View or complete a review\n  tasks             List current tasks";
}
