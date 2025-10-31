import read from "./utils/read.js";
import { generateAFD } from "./utils/generate.js";
import analyzer from "./utils/analyzer.js";
import printAFD from "./utils/printAFD.js";

try {
  const tokens = read("./inputs/tokens.in");
  const example = read("./inputs/example.in", false);
  const grammar = read("./inputs/grammar.in");

  const AFD = generateAFD(tokens, grammar);

  const { tape, ts } = analyzer(AFD, example);

  printAFD(AFD);

  console.log(`\n\n[${tape.join(", ")}]\n`);
  ts.forEach((txt) =>
    console.log(
      `${String(txt.line).padStart(4)} | ${String(txt.state).padStart(
        4
      )} | ${String(txt.label).padEnd(20)}`
    )
  );

  console.log(getSyntaxTape(tokens, AFD, tape));
} catch (e) {
  console.log(e);
}

function getTranslate() {
  return {
    D0: "->S ",
    D1: "[AC]",
    D2: "*I",
    D3: "*[FI]",
    D4: "*B",
    D5: "D",
    D6: "G",
    D7: "*E",
    D8: "*H",
    X: "*X",
  };
}

function getSyntaxTape(tokens, AFD, prev_tape) {
  const statesArr = [...AFD.states];

  let dic = { X: "X" };

  tokens.forEach((token) => {
    const { tape } = analyzer(AFD, token);
    dic[tape[0]] = `T_${token}`;
  });

  statesArr.forEach((st) => {
    if (!dic?.[st]) {
      dic[st] = "T_id";
    }
  });

  return prev_tape.map((key) => dic[key]);
}
