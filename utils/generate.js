import { AFND } from "../AFND/index.js";
import { merge } from "./assembler.js";

export function generateAFNDs(tokens, grammars) {
  let AFNDs = { reserved: {}, grammar: {} };
  tokens.map((t) => {
    const automaton = new AFND(new Set(["q0"]), new Set(), {}, "q0", new Set());
    let i = 0;
    let curr_state = "q0";

    for (const char of t) {
      i++;
      const new_state = "q" + i;
      automaton.alphabet.add(char);
      automaton.add_state(new_state);
      automaton.add_transition(curr_state, char, new_state);
      curr_state = new_state;
    }

    automaton.final_states.add(curr_state);

    AFNDs.reserved[t] = automaton;
  });

  Object.keys(grammars).forEach((key) => {
    const grammar = grammars[key];
    const rawStates = new Set();
    const rawFinalStates = new Set();
    const rawTransitions = [];

    grammar.forEach((production) => {
      const [state, transitions] = production.split("::=");
      const from = state.trim();

      rawStates.add(from);

      transitions.split("|").forEach((prod) => {
        const trimmed = prod.trim();

        if (!trimmed) {
          rawFinalStates.add(from);
          return;
        }

        if (trimmed === trimmed.toLowerCase()) {
          rawFinalStates.add(from);
          return;
        }

        let terminal = "";
        let nextState = "";

        trimmed.split("").forEach((char) => {
          if (/[A-Z]/.test(char)) {
            nextState = char;
            rawStates.add(char);
          } else {
            terminal += char;
          }
        });

        rawTransitions.push({ from, terminal, to: nextState });
      });
    });

    const sortedStates = [...rawStates].sort((a, b) =>
      a === "S" ? -1 : b === "S" ? 1 : a.localeCompare(b)
    );

    const stateMap = new Map();
    const states = new Set();

    sortedStates.forEach((st, i) => {
      const newName = `q${i}`;
      stateMap.set(st, newName);
      states.add(newName);
    });

    const finals = new Set([...rawFinalStates].map((st) => stateMap.get(st)));

    const startSymbol = grammar[0].split("::=")[0].trim();
    const initialState = stateMap.get(startSymbol);

    const automaton = new AFND(states, new Set(), {}, initialState, finals);

    rawTransitions.forEach(({ from, terminal, to }) => {
      if (terminal) automaton.alphabet.add(terminal);
      if (to)
        automaton.add_transition(
          stateMap.get(from),
          terminal,
          stateMap.get(to)
        );
    });

    AFNDs.grammar[key] = automaton;
  });

  return AFNDs;
}

export function generateAFD(tokens, grammars) {
  const AFNDs = generateAFNDs(tokens, grammars);

  const mergedAFND = merge([
    ...Object.values(AFNDs.reserved),
    ...Object.values(AFNDs.grammar),
  ]);
  const AFD = mergedAFND.determinizeAndIncludeErrState();

  return { AFD, AFNDs };
}
