import { Empty, NonEmpty } from './prelude.mjs';

export function getArgs() {
  const args = process.argv.slice(2);
  
  // Convert JavaScript array to Gleam List
  let gleamList = new Empty();
  for (let i = args.length - 1; i >= 0; i--) {
    gleamList = new NonEmpty(args[i], gleamList);
  }
  
  return gleamList;
}

export function intToString(i) {
  return i.toString();
}
