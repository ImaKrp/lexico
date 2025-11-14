import getSlr from "./utils/genSlr.js";
import PDA_SLR from "./PDA/index.js";
import lexic from "../Lexico/index.js";

const { tape, ts } = lexic();

const { dic, table, redGuide } = getSlr();

const pda = new PDA_SLR(dic, table, redGuide, ts);

const result = pda.run(tape, false);

if (!result.ok) {
  console.error("ERRO:");
  console.error(result.error.message);
} else {
  console.log(pda.syntax_values);
  console.log("✅ Cadeia aceita!");
}
