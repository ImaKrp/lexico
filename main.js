import read from "./utils/read.js";
import { unirAFNDs } from "./utils/assembler.js";
import * as generate from "./utils/generate.js";
import analyzer from "./utils/analyzer.js";

try {
  const tokens = read("./inputs/tokens.in");
  const example = read("./inputs/example.in", false);
  // const grammar = read("./inputs/grammar.in");

  const grammar = ["S::=fA|aA|eA|iA", "A::=fA|aA|eA|iA|"];

  let tape = [];
  let ts = [];

  let AFNDs = [];
  AFNDs = generate.byTokens(tokens);
  AFNDs = generate.byGrammar(grammar, AFNDs);
  let AFNDUnique = unirAFNDs(AFNDs);
  let AFDetrministico = AFNDUnique.determinizar();
  analyzer(AFDetrministico, tape, ts, example);

  console.log(tape);
  ts.forEach((txt) =>
    console.log(`${txt.line} | ${txt.state}  | ${txt.label}`)
  );
} catch (e) {
  console.log(e);
}
