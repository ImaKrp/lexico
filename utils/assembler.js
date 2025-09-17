import { AFND } from "../AFND/index.js";

/**
 * Junta dois ou mais AFNDs em um único.
 *
 * @param {AFND[]} AFNDs
 * @param {string} estadoInicial - Padrão "q0"
 * @returns {AFND}
 */
export function unirAFNDs(AFNDs, estadoInicial = "q0") {
  if (!AFNDs || AFNDs.length === 0) {
    return new AFND(
      new Set([estadoInicial]),
      new Set(),
      {},
      estadoInicial,
      new Set()
    );
  }
  if (AFNDs.length === 1) {
    return AFNDs[0];
  }

  const novosEstados = new Set([estadoInicial]);
  const novoAlfabeto = new Set();
  const novasTransicoes = {};
  const novosfinal_states = new Set();

  AFNDs.forEach((automato, i) => {
    const mapaRenomeacao = { [automato.estadoInicial]: estadoInicial };

    // Renomeia estados (menos o inicial)
    for (const estado of automato.estados) {
      if (estado !== automato.estadoInicial) {
        mapaRenomeacao[estado] = `${i}.${estado}`;
      }
    }

    // Adiciona estados e alphabet
    novosEstados.forEach((e) => novosEstados.add(e));
    for (const e of Object.values(mapaRenomeacao)) novosEstados.add(e);
    for (const a of automato.alphabet) novoAlfabeto.add(a);

    // Estados finais
    for (const ef of automato.final_states) {
      novosfinal_states.add(mapaRenomeacao[ef]);
    }

    // Transições
    for (const [key, destinos] of automato.transicoes.entries()) {
      const [origem, simbolo] = JSON.parse(key);
      const novaOrigem = mapaRenomeacao[origem];
      const novosDestinos = new Set(
        [...destinos].map((d) => mapaRenomeacao[d])
      );

      const chaveTransicao = JSON.stringify([novaOrigem, simbolo]);
      if (novasTransicoes[chaveTransicao]) {
        for (const d of novosDestinos) novasTransicoes[chaveTransicao].add(d);
      } else {
        novasTransicoes[chaveTransicao] = novosDestinos;
      }
    }
  });

  return new AFND(
    novosEstados,
    novoAlfabeto,
    novasTransicoes,
    estadoInicial,
    novosfinal_states
  );
}
