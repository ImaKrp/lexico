function analyzer(automaton, conteudo) {
  const tape = [];
  const ts = [];
  conteudo.split("\n").forEach((line, i) => {
    line = line.trim().split(" ");

    line.forEach((label) => {
      let curr_state = automaton.initial_state;

      for (const c of label) {
        const next_state = automaton.next_state(curr_state, c);

        if (!next_state) {
          curr_state = "X";
          break;
        }

        curr_state = next_state;
      }

      if (!automaton.final_states.has(curr_state)) {
        curr_state = "X";
      }

      tape.push(curr_state);
      ts.push({ line: i, state: curr_state, label });
    });
  });

  return { tape, ts };
}

export default analyzer;
