import read from "./utils/read.js";
import { generateAFD } from "./utils/generate.js";
import analyzer from "./utils/analyzer.js";

try {
  const tokens = read("./inputs/tokens.in");
  const example = read("./inputs/example.in", false);
  const id = read("./inputs/id_grammar.in");
  const num = read("./inputs/num_grammar.in");

  const { AFNDs } = generateAFD(tokens, { id, num });

  const { tape, ts } = analyzer(example, AFNDs);

  console.log(`\n\n[${tape.join(", ")}]\n`);
  ts.forEach((txt) =>
    console.log(
      `${String(txt.line).padStart(4)} | ${String(txt.token).padStart(
        14
      )} | ${String(txt.label).padEnd(20)}`
    )
  );
} catch (e) {
  console.log(e);
}
