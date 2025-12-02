import getSlr from "./utils/genSlr.js";
import otimizer from "./utils/otimizer.js";
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

  setTimeout(() => {
    console.log();
    console.log("CADEIA OTIMIZADA");
    console.log("________________");

    console.log();

    const L = otimizer(result.file);

    const stringified_L = `L = ${JSON.stringify(L)
      .replaceAll(`"`, "")
      .replaceAll(",", ", ")
      .replace("[", "{ ")
      .replace("]", " }")}`;

    console.log("<" + "-".repeat(stringified_L.length - 1));
    console.log(stringified_L);
  }, 300);
}
