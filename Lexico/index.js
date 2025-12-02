import read from "../utils/read.js";
import { generateAFD } from "./utils/generate.js";
import analyzer from "./utils/analyzer.js";

const treat = (entry) => {
  return entry.replace(/([\[\],])/g, " $1 ");
};

const lexic = () => {
  try {
    const tokens = read("./inputs/tokens.in");
    const example = read("./inputs/example.in", false);
    const id = read("./inputs/id_grammar.in");
    const num = read("./inputs/num_grammar.in");
    const comp_op = read("./inputs/tokens_comp_op.in");
    const op = read("./inputs/tokens_op.in");

    const { AFNDs } = generateAFD(tokens, { comp_op, op }, { id, num });

    const treatedEntry = treat(example);

    const { tape, ts } = analyzer(treatedEntry, AFNDs);

    return { tape, ts };
  } catch (e) {
    console.log(e);
  }
};

export default lexic;
