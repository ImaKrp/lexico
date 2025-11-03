import getSlr from "./utils/genSlr.js";
import PDA_SLR from "./PDA/index.js";
import lexic from "../Lexico/index.js";

const { tape, ts } = lexic();

const { dic, table, redGuide } = getSlr();

const pda = new PDA_SLR(dic, table, redGuide);

pda.run(tape);
