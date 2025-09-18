export class AFND {
  constructor(states, alphabet, transitions, initial_state, final_states) {
    this.states = new Set(states);
    this.alphabet = new Set(alphabet);
    this.transitions = new Map();

    if (transitions instanceof Map) {
      this.transitions = transitions;
    } else {
      for (const [key, destinations] of Object.entries(transitions)) {
        this.transitions.set(JSON.parse(key), new Set(destinations));
      }
    }

    this.initial_state = initial_state;
    this.final_states = new Set(final_states);
  }

  add_state(state, is_final = false) {
    this.states.add(state);
    if (is_final) this.final_states.add(state);
  }

  add_transition(origin, symbol, destination) {
    if (!this.states.has(origin)) {
      throw new Error(`Origin state '${origin}' does not exist.`);
    }
    if (!this.states.has(destination)) {
      throw new Error(`Destination state '${destination}' does not exist.`);
    }
    if (symbol && !this.alphabet.has(symbol)) {
      throw new Error(`Symbol '${symbol}' does not belong to the alphabet.`);
    }

    const key = JSON.stringify([origin, symbol]);
    if (this.transitions.has(key)) {
      this.transitions.get(key).add(destination);
    } else {
      this.transitions.set(key, new Set([destination]));
    }
  }

  determinize() {
    const dfaStatesMap = new Map();
    const dfaTransitions = new Map();
    const dfaFinalStates = new Set();
    const dfaAlphabet = new Set(this.alphabet);

    let stateCounter = 0;

    const startSet = new Set([this.initial_state]);
    const startKey = [...startSet].sort().join(",");
    dfaStatesMap.set(startKey, `D${stateCounter++}`);

    const queue = [startSet];

    while (queue.length > 0) {
      const currentSet = queue.shift();
      const currentKey = [...currentSet].sort().join(",");
      const currentDfaState = dfaStatesMap.get(currentKey);

      dfaAlphabet.forEach((symbol) => {
        const nextSet = new Set();

        currentSet.forEach((nfaState) => {
          // percorre todas as keys do Map e pega as que batem
          for (const [tKey, destinations] of this.transitions.entries()) {
            const [origin, transSymbol] = Array.isArray(tKey)
              ? tKey
              : JSON.parse(tKey);
            if (origin === nfaState && transSymbol === symbol) {
              destinations.forEach((target) => nextSet.add(target));
            }
          }
        });

        if (nextSet.size === 0) return;

        const nextKey = [...nextSet].sort().join(",");
        if (!dfaStatesMap.has(nextKey)) {
          dfaStatesMap.set(nextKey, `D${stateCounter++}`);
          queue.push(nextSet);
        }

        const nextDfaState = dfaStatesMap.get(nextKey);
        dfaTransitions.set(
          `${currentDfaState},${symbol}`,
          new Set([nextDfaState])
        );
      });
    }

    // identificar estados finais
    for (const [key, dfaState] of dfaStatesMap.entries()) {
      const nfaStates = new Set(key.split(","));
      for (const fs of this.final_states) {
        if (nfaStates.has(fs)) {
          dfaFinalStates.add(dfaState);
          break;
        }
      }
    }

    return new AFND(
      new Set(dfaStatesMap.values()),
      dfaAlphabet,
      dfaTransitions,
      dfaStatesMap.get(startKey),
      dfaFinalStates
    );
  }

  next_state(current_state, symbol) {
    const key = `${current_state},${symbol}`;
    const destinations = this.transitions.get(key) || new Set();

    if (destinations.size > 0) {
      return [...destinations][0];
    }
    return null;
  }

  display_automaton() {
    const initial_state = this.initial_state;
    const other_states = [...this.states].filter((s) => s !== initial_state);
    const ordered_states = [initial_state, ...other_states.sort()];

    const has_epsilon = [...this.transitions.keys()].some(
      (k) => JSON.parse(k)[1] === ""
    );

    const ordered_alphabet = [...this.alphabet].sort();
    if (has_epsilon) ordered_alphabet.push("");

    const col_widths = {};
    for (const s of ordered_alphabet) {
      col_widths[s] = s === "" ? 1 : s.length;
    }

    let state_col_width = 0;
    for (const state of ordered_states) {
      let prefix = "";
      if (state === this.initial_state) prefix += "->";
      if (this.final_states.has(state)) prefix += "*";
      state_col_width = Math.max(state_col_width, (prefix + state).length);
    }

    process.stdout.write(" ".padEnd(state_col_width) + " |");
    for (const symbol of ordered_alphabet) {
      const disp = symbol === "" ? "ε" : symbol;
      process.stdout.write(
        ` ${disp
          .padStart(col_widths[symbol], " ")
          .padEnd(col_widths[symbol], " ")} |`
      );
    }
    console.log();

    console.log(
      "-".repeat(state_col_width) +
        "+" +
        ordered_alphabet.map((s) => "-".repeat(col_widths[s] + 2)).join("+") +
        "+"
    );

    for (const state of ordered_states) {
      let prefix = "";
      if (state === this.initial_state) prefix += "->";
      if (this.final_states.has(state)) prefix += "*";

      process.stdout.write(
        (prefix + state).padEnd(state_col_width, " ") + " |"
      );

      for (const symbol of ordered_alphabet) {
        const key = JSON.stringify([state, symbol]);
        const destinations = this.transitions.get(key) || new Set();
        const text =
          destinations.size > 0
            ? `{${[...destinations].sort().join(", ")}}`
            : "-";
        process.stdout.write(` ${text.padEnd(col_widths[symbol])} |`);
      }
      console.log();
    }
  }
}
