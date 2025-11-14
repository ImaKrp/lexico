import getSlr from "./utils/genSlr.js";
import PDA_SLR from "./PDA/index.js";
import lexic from "../Lexico/index.js";

const { tape, ts } = lexic();

const { dic, table, redGuide } = getSlr();

const pda = new PDA_SLR(dic, table, redGuide, ts);

const result = pda.run(tape, false);

if (!result.ok) {
  console.log("ERRO:");
  console.log(result.error.line, result.error.token, result.error.label);
  console.log(result.error.message);
}

console.log(pda.syntax_values);
