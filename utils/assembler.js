import { AFND } from "../AFND/index.js";

export function merge(AFNDs, initial_state = "q0") {
  if (!AFNDs || AFNDs.length === 0) {
    return new AFND(
      new Set([initial_state]),
      new Set(),
      {},
      initial_state,
      new Set()
    );
  }
  if (AFNDs.length === 1) {
    return AFNDs[0];
  }

  const newStates = new Set([initial_state]);
  const newAlphabet = new Set();
  const newTransitions = {};
  const newFinalStates = new Set();

  AFNDs.forEach((automaton, i) => {
    const renameMap = { [automaton.initial_state]: initial_state };

    // Rename states (except the initial one)
    for (const state of automaton.states) {
      if (state !== automaton.initial_state) {
        renameMap[state] = `${i}.${state}`;
      }
    }

    // Add states and alphabet
    newStates.forEach((s) => newStates.add(s));
    for (const s of Object.values(renameMap)) newStates.add(s);
    for (const a of automaton.alphabet) newAlphabet.add(a);

    // Final states
    for (const fs of automaton.final_states) {
      newFinalStates.add(renameMap[fs]);
    }

    // Transitions
    for (const [key, targets] of automaton.transitions.entries()) {
      const [origin, symbol] = JSON.parse(key);
      const newOrigin = renameMap[origin];
      const newTargets = new Set([...targets].map((t) => renameMap[t]));

      const transitionKey = JSON.stringify([newOrigin, symbol]);
      if (newTransitions[transitionKey]) {
        for (const t of newTargets) newTransitions[transitionKey].add(t);
      } else {
        newTransitions[transitionKey] = newTargets;
      }
    }
  });

  return new AFND(
    newStates,
    newAlphabet,
    newTransitions,
    initial_state,
    newFinalStates
  );
}
