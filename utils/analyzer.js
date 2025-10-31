const getTokenType = (label, state, dic, AFNDs) => {
  if (dic?.[state]) return dic[state];

  for (const key in AFNDs.grammar) {
    const automaton = AFNDs.grammar[key];
    const { tape } = afdAnalyzer(automaton, label, undefined, undefined, false);
    if (tape[0] && tape[0] !== "X") return `T_${key}`;
  }
  return "X";
};

function afdAnalyzer(automaton, conteudo, dic, AFNDs, treat = true) {
  const tape = [];
  const ts = [];
  const alphabet = automaton.alphabet;
  conteudo.split("\n").forEach((line, i) => {
    const labels = line.trim().split(" ");

    labels.forEach((label) => {
      let curr_state = automaton.initial_state;

      for (const c of label) {
        if (!alphabet.has(c)) {
          curr_state = "X";
          break;
        }

        const next_state = automaton.next_state(curr_state, c);

        curr_state = next_state[0];
      }

      if (!automaton.final_states.has(curr_state)) {
        curr_state = "X";
      }

      if (treat) curr_state = getTokenType(label, curr_state, dic, AFNDs);

      tape.push(curr_state);
      ts.push({ line: i, state: curr_state, label });
    });
  });

  return { tape, ts };
}

export default afdAnalyzer;
