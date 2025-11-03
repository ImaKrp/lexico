function identifyToken(label, automatonMap) {
  for (const [tokenType, automaton] of Object.entries(automatonMap)) {
    let curr = automaton.initial_state;
    let accepted = true;

    for (const c of label) {
      const next = automaton.next_state(curr, c);

      if (!next?.[0]) {
        accepted = false;
        break;
      }
      curr = next[0];
    }

    if (accepted && automaton.final_states.has(curr)) {
      return `T_${tokenType}`;
    }
  }
  return "X";
}

function analyzer(content, automatonMap) {
  const tape = [];
  const ts = [];

  content.split("\n").forEach((line, i) => {
    const labels = line.trim().split(" ");

    labels.forEach((label) => {
      const tokenType = identifyToken(label, {
        ...automatonMap.reserved,
        ...automatonMap.grammar,
      });

      tape.push(tokenType);
      ts.push({ line: i, token: tokenType, label });
    });
  });

  return { tape, ts };
}

export default analyzer;
