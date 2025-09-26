export class AFND {
  constructor(states, alphabet, transitions, initial_state, final_states) {
    this.states = new Set(states);
    this.alphabet = new Set(alphabet);
    this.transitions = new Map();

    if (transitions instanceof Map) {
      this.transitions = transitions;
    } else {
      for (const [key, destinations] of Object.entries(transitions)) {
        const [origin, char] = key.split(",");
        this.add_transition(origin, char, destinations);
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
    if (destination instanceof Set) {
      destination = [...destination];
    }
    if (!Array.isArray(destination)) destination = [destination];

    if (!this.states.has(origin)) {
      throw new Error(`Origin state '${origin}' does not exist.`);
    }

    destination.forEach((d) => {
      if (!this.states.has(d)) {
        throw new Error(`Destination state '${d}' does not exist.`);
      }
      if (symbol && !this.alphabet.has(symbol)) {
        throw new Error(`Symbol '${symbol}' does not belong to the alphabet.`);
      }

      const key = `${origin},${symbol}`;
      if (this.transitions.has(key)) {
        this.transitions.get(key).add(d);
      } else {
        this.transitions.set(key, new Set([d]));
      }
    });
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
          for (const [tKey, destinations] of this.transitions.entries()) {
            const [origin, transSymbol] = tKey.split(",");
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

  determinizeAndIncludeErrState() {
    const determinized = this.determinize();

    determinized.add_state("X");

    determinized.alphabet.forEach((char) => {
      determinized.add_transition("X", char, "X");

      determinized.states.forEach((state) => {
        if (!determinized.next_state(state, char))
          determinized.add_transition(state, char, "X");
      });
    });

    return determinized;
  }

  next_state(current_state, symbol) {
    const key = `${current_state},${symbol}`;

    const destinations = this.transitions.get(key) || new Set();

    if (destinations.size > 0) {
      return [...destinations];
    }
    return null;
  }
}
