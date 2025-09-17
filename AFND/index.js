export class AFND {
  constructor(estados, alphabet, transicoes, estadoInicial, final_states) {
    this.estados = new Set(estados);
    this.alphabet = new Set(alphabet);
    this.transicoes = new Map();

    // Normaliza transições (aceita objeto { (estado, simbolo): {destinos} })
    if (transicoes instanceof Map) {
      this.transicoes = transicoes;
    } else {
      for (const [key, destinos] of Object.entries(transicoes)) {
        this.transicoes.set(JSON.parse(key), new Set(destinos));
      }
    }

    this.estadoInicial = estadoInicial;
    this.final_states = new Set(final_states);
  }

  push_state(estado, is_final = false) {
    this.estados.add(estado);
    if (is_final) this.final_states.add(estado);
  }

  push_transition(origem, simbolo, destino) {
    if (!this.estados.has(origem)) {
      throw new Error(`Estado de origem '${origem}' não existe.`);
    }
    if (!this.estados.has(destino)) {
      throw new Error(`Estado de destino '${destino}' não existe.`);
    }
    if (simbolo && !this.alphabet.has(simbolo)) {
      throw new Error(`Símbolo '${simbolo}' não pertence ao alphabet.`);
    }

    const chave = JSON.stringify([origem, simbolo]);
    if (this.transicoes.has(chave)) {
      this.transicoes.get(chave).add(destino);
    } else {
      this.transicoes.set(chave, new Set([destino]));
    }
  }

  determinizar() {
    const estadoInicialAfd = new Set([this.estadoInicial]);
    const afdTransicoes = new Map();
    const afdfinal_states = new Set();

    const mapaEstados = new Map();
    mapaEstados.set(JSON.stringify([...estadoInicialAfd]), "D0");

    const filaTrabalho = [estadoInicialAfd];
    let contEstados = 1;

    while (filaTrabalho.length > 0) {
      const conjuntoAtualNfa = filaTrabalho.shift();
      const nomeEstadoAtualDfa = mapaEstados.get(
        JSON.stringify([...conjuntoAtualNfa])
      );

      for (const simbolo of this.alphabet) {
        const proximosEstadosNfa = new Set();

        for (const estadoNfa of conjuntoAtualNfa) {
          const chave = JSON.stringify([estadoNfa, simbolo]);
          const destinos = this.transicoes.get(chave) || new Set();
          for (const d of destinos) proximosEstadosNfa.add(d);
        }

        if (proximosEstadosNfa.size === 0) continue;

        const chaveProx = JSON.stringify([...proximosEstadosNfa]);
        if (!mapaEstados.has(chaveProx)) {
          const novoNome = `D${contEstados}`;
          mapaEstados.set(chaveProx, novoNome);
          filaTrabalho.push(proximosEstadosNfa);
          contEstados++;
        }

        const nomeProx = mapaEstados.get(chaveProx);
        afdTransicoes.set(
          JSON.stringify([nomeEstadoAtualDfa, simbolo]),
          new Set([nomeProx])
        );
      }
    }

    const dfaEstados = new Set(mapaEstados.values());
    for (const [conjuntoNfaJson, nomeDfa] of mapaEstados.entries()) {
      const conjuntoNfa = new Set(JSON.parse(conjuntoNfaJson));
      for (const final of this.final_states) {
        if (conjuntoNfa.has(final)) {
          afdfinal_states.add(nomeDfa);
        }
      }
    }

    return new AFND(
      dfaEstados,
      this.alphabet,
      afdTransicoes,
      "D0",
      afdfinal_states
    );
  }

  next_state(estadoAtual, simbolo) {
    const chave = JSON.stringify([estadoAtual, simbolo]);
    const destinos = this.transicoes.get(chave) || new Set();
    if (destinos.size > 0) {
      return [...destinos][0];
    }
    return null;
  }

  exibir_automato() {
    const estadoInicial = this.estadoInicial;
    const outrosEstados = [...this.estados].filter((e) => e !== estadoInicial);
    const estadosOrdenados = [estadoInicial, ...outrosEstados.sort()];

    const hasEpsilon = [...this.transicoes.keys()].some(
      (k) => JSON.parse(k)[1] === ""
    );

    const alfabetoOrdenado = [...this.alphabet].sort();
    if (hasEpsilon) alfabetoOrdenado.push("");

    const larguraCols = {};
    for (const s of alfabetoOrdenado) larguraCols[s] = s === "" ? 1 : s.length;

    let larguraColEstados = 0;
    for (const estado of estadosOrdenados) {
      let prefixo = "";
      if (estado === this.estadoInicial) prefixo += "->";
      if (this.final_states.has(estado)) prefixo += "*";
      larguraColEstados = Math.max(
        larguraColEstados,
        (prefixo + estado).length
      );
    }

    // Cabeçalho
    process.stdout.write(" ".padEnd(larguraColEstados) + " |");
    for (const simbolo of alfabetoOrdenado) {
      const disp = simbolo === "" ? "ε" : simbolo;
      process.stdout.write(
        ` ${disp
          .padStart(larguraCols[simbolo], " ")
          .padEnd(larguraCols[simbolo], " ")} |`
      );
    }
    console.log();

    console.log(
      "-".repeat(larguraColEstados) +
        "+" +
        alfabetoOrdenado.map((s) => "-".repeat(larguraCols[s] + 2)).join("+") +
        "+"
    );

    // Linhas
    for (const estado of estadosOrdenados) {
      let prefixo = "";
      if (estado === this.estadoInicial) prefixo += "->";
      if (this.final_states.has(estado)) prefixo += "*";

      process.stdout.write(
        (prefixo + estado).padEnd(larguraColEstados, " ") + " |"
      );

      for (const simbolo of alfabetoOrdenado) {
        const chave = JSON.stringify([estado, simbolo]);
        const destinos = this.transicoes.get(chave) || new Set();
        const texto =
          destinos.size > 0 ? `{${[...destinos].sort().join(", ")}}` : "-";
        process.stdout.write(` ${texto.padEnd(larguraCols[simbolo])} |`);
      }
      console.log();
    }
  }
}
