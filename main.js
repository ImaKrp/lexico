import read from "./utils/read.js";
import { generateAFD } from "./utils/generate.js";
import analyzer from "./utils/analyzer.js";
import printAFD from "./utils/printAFD.js";

try {
  const tokens = read("./inputs/tokens.in");
  const example = read("./inputs/example.in", false);
  const id = read("./inputs/id_grammar.in");
  const num = read("./inputs/num_grammar.in");

  const { AFD, AFNDs } = generateAFD(tokens, { id, num });

  const { tape, ts } = analyzer(AFD, example, getSyntaxDic(tokens, AFD), AFNDs);

  // printAFD(AFD);

  console.log(`\n\n[${tape.join(", ")}]\n`);
  ts.forEach((txt) =>
    console.log(
      `${String(txt.line).padStart(4)} | ${String(txt.state).padStart(
        7
      )} | ${String(txt.label).padEnd(20)}`
    )
  );
} catch (e) {
  console.log(e);
}

function getSyntaxDic(tokens, AFD) {
  let dic = { X: "X" };

  tokens.forEach((token) => {
    const { tape } = analyzer(AFD, token, undefined, undefined, false);
    dic[tape[0]] = `T_${token}`;
  });

  return dic;
}
