import { AFND } from "../AFND/index.js";

export function byTokens(tokens, AFNDs = []) {
  tokens.map((t) => {
    const automaton = new AFND(new Set(["q0"]), new Set(), {}, "q0", new Set());
    let i = 0;
    let curr_state = "q0";

    for (const char of t) {
      i++;
      const new_state = "q" + i;
      automaton.alphabet.add(char);
      automaton.push_state(new_state);
      automaton.push_transition(curr_state, char, new_state);
      curr_state = new_state;
    }

    automaton.final_states.add(curr_state);

    AFNDs.push(automaton);
  });

  return AFNDs;
}

export function byGrammar(grammar, AFNDs = []) {
  const non_terminal_relactions = {};
  const final_states = new Set();
  const states = new Set();
  let non_terminal_states = new Set();

  grammar.forEach((production) => {
    const [state, transitions] = production.split("::=");
    non_terminal_states.add(state.trim());

    transitions.split("|").forEach((prod) => {
      if (!prod) final_states.add(state);
      else non_terminal_states.add(state);
    });
  });

  non_terminal_states = [...non_terminal_states].sort((a, b) => {
    if (a === "S") return -1;
    if (b === "S") return 1;
    return a.localeCompare(b);
  });

  let i = 0;

  non_terminal_states.forEach((nt) => {
    const new_name = `q${i}`;
    non_terminal_relactions[nt] = new_name;
    states.add(new_name);
    i++;
  });

  final_states.forEach((nt) => {
    const new_name = `q${i}`;
    final_states[nt] = new_name;
    states.add(new_name);
    i++;
  });

  const simboloInicial = grammar[0].split("::=")[0].trim();
  const estadoInicial = non_terminal_relactions[simboloInicial];

  const automato = new AFND(states, new Set(), {}, estadoInicial, final_states);

  grammar.forEach((production) => {
    let [state, transitions] = production.split("::=");
    state = state.trim();
    const from_state = non_terminal_relactions[state];

    for (const prod of transitions.split("|")) {
      let proximoEstado = "";
      let terminal = "";

      for (const char of prod.trim()) {
        if (char >= "A" && char <= "Z") {
          proximoEstado = char;
        } else {
          terminal += char;
        }
      }

      if (terminal) {
        automato.alphabet.add(terminal);
      } else {
        automato.final_states.add(from_state);
      }

      if (!proximoEstado) continue;

      const estadoDestino = non_terminal_relactions[proximoEstado];
      automato.push_transition(from_state, terminal, estadoDestino);
    }
  });

  AFNDs.push(automato);

  return AFNDs;
}
