import read from "./utils/read.js";

try {
  const tokens = read("./inputs/tokens.in");
  const example = read("./inputs/example.in");
  const grammar = read("./inputs/grammar.in");

  console.log(tokens);
  console.log(example);
  console.log(grammar);
} catch (e) {
  console.log(e);
}
