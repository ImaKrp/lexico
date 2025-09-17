function analyzer(automaton, tape, ts, conteudo) {
  conteudo.split("\n").forEach((line, i) => {
    line = line.trim().split(" ");

    line.forEach((label) => {
      let curr_state = automaton.estadoInicial;

      for (const c of label) {
        const next_state = automaton.next_state(curr_state, c);

        console.log(automaton);

        if (!next_state) {
          curr_state = "X";
          break;
        }

        curr_state = next_state;
      }

      if (!automaton.final_states.has(curr_state)) {
        curr_state = "X";
      }

      console.log(curr_state, i, label);

      tape.push(curr_state);
      ts.push({ line: i, state: curr_state, label });
    });
  });
}

export default analyzer;
