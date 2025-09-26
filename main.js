import read from "./utils/read.js";
import { generateAFD } from "./utils/generate.js";
import analyzer from "./utils/analyzer.js";

try {
  const tokens = read("./inputs/tokens.in");
  const example = read("./inputs/example.in", false);
  const grammar = read("./inputs/grammar.in");

  const AFD = generateAFD(tokens, grammar);

  const {tape, ts} = analyzer(AFD, example);

  console.log(`[${tape.join(", ")}]\n`);
  ts.forEach((txt) =>
    console.log(
      `${String(txt.line).padStart(4)} | ${String(txt.state).padStart(
        4
      )} | ${String(txt.label).padEnd(20)}`
    )
  );
} catch (e) {
  console.log(e);
}
