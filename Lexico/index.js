import read from "../utils/read.js";
import { generateAFD } from "./utils/generate.js";
import analyzer from "./utils/analyzer.js";

const lexic = () => {
  try {
    const tokens = read("./inputs/tokens.in");
    const example = read("./inputs/example.in", false);
    const id = read("./inputs/id_grammar.in");
    const num = read("./inputs/num_grammar.in");
    const comp_op = read("./inputs/comp_op_grammar.in");
    const op = read("./inputs/op_grammar.in");

    const { AFNDs, AFDs } = generateAFD(tokens, { id, num, comp_op, op });

    const { tape, ts } = analyzer(example, AFNDs);

    return { tape, ts };
  } catch (e) {
    console.log(e);
  }
};

export default lexic;
