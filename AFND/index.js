class AFND {
  constructor(estados, alfabeto, transicoes, estadoInicial, estadosFinais) {
    this.estados = new Set(...estados);
    this.alfabeto = new Set(...alfabeto);
    this.transicoes = transicoes;
    this.estadoInicial = estadoInicial;
    this.estadosFinais = new Set(...estadosFinais);
  }

  adicionarEstado(estado, ehFinal = false) {
    this.estados.add(estado);
    if (ehFinal) this.estadosFinais.add(estado);
  }

  adicionarTransicao(origem, simbolo, destino) {
    if (!this.estados.has(origem))
      throw new Error(`Estado de origem '${origem}' não existe.`);
    if (!this.estados.has(destino))
      throw new Error(`Estado de destino '${destino}' não existe.`);
    if (simbolo && !this.alfabeto.has(simbolo))
      throw new Error(`Símbolo '${simbolo}' não pertence ao alfabeto.`);

    const chave = [origem, simbolo].toString();
    if (!this.transicoes.has(chave)) {
      this.transicoes.set(chave, new Set());
    }
    this.transicoes.get(chave).add(destino);
  }

  /**
   * Converte este AFND em AFD (determinizar).
   * Retorna um novo objeto AFND (determinístico).
   */
  determinizar() {
    const estadoInicialAfd = new Set([this.estadoInicial]);
    const afdTransicoes = new Map();
    const afdEstadosFinais = new Set();

    const mapaEstados = new Map();
    mapaEstados.set(this._setToKey(estadoInicialAfd), "D0");

    const fila = [estadoInicialAfd];
    let contEstados = 1;

    while (fila.length > 0) {
      const conjuntoAtual = fila.shift();
      const nomeEstadoAtual = mapaEstados.get(this._setToKey(conjuntoAtual));

      for (let simbolo of this.alfabeto) {
        const proximos = new Set();

        for (let estado of conjuntoAtual) {
          const chave = [estado, simbolo].toString();
          if (this.transicoes.has(chave)) {
            for (let destino of this.transicoes.get(chave)) {
              proximos.add(destino);
            }
          }
        }

        if (proximos.size === 0) continue;

        const chaveProximos = this._setToKey(proximos);

        if (!mapaEstados.has(chaveProximos)) {
          const novoNome = `D${contEstados}`;
          mapaEstados.set(chaveProximos, novoNome);
          fila.push(proximos);
          contEstados++;
        }

        const nomeProx = mapaEstados.get(chaveProximos);
        afdTransicoes.set(
          [nomeEstadoAtual, simbolo].toString(),
          new Set([nomeProx])
        );
      }
    }

    const dfaEstados = new Set(mapaEstados.values());
    for (let [conjuntoStr, nomeDfa] of mapaEstados.entries()) {
      const conjunto = this._keyToSet(conjuntoStr);
      for (let s of conjunto) {
        if (this.estadosFinais.has(s)) {
          afdEstadosFinais.add(nomeDfa);
        }
      }
    }

    // Converte Map para objeto normal para reuso
    const transObj = {};
    for (let [k, v] of afdTransicoes.entries()) {
      transObj[JSON.stringify(k.split(","))] = Array.from(v);
    }

    return new AFND(
      Array.from(dfaEstados),
      Array.from(this.alfabeto),
      transObj,
      "D0",
      Array.from(afdEstadosFinais)
    );
  }

  proximoEstado(estadoAtual, simbolo) {
    const chave = [estadoAtual, simbolo].toString();
    if (this.transicoes.has(chave)) {
      return Array.from(this.transicoes.get(chave))[0];
    }
    return null;
  }

  exibirAutomato() {
    const estadoInicial = this.estadoInicial;
    const outros = Array.from(this.estados)
      .filter((e) => e !== estadoInicial)
      .sort();
    const estadosOrdenados = [estadoInicial, ...outros];

    const hasEpsilon = Array.from(this.transicoes.keys()).some(
      (k) => k.split(",")[1] === ""
    );
    const alfabetoOrdenado = Array.from(this.alfabeto).sort();
    if (hasEpsilon) alfabetoOrdenado.push("");

    const larguraColEstados = Math.max(
      ...estadosOrdenados.map((e) => e.length + 2)
    );
    const larguraCols = {};
    for (let simbolo of alfabetoOrdenado) {
      larguraCols[simbolo] = Math.max(1, simbolo.length);
    }

    console.log(
      " ".padEnd(larguraColEstados) +
        " | " +
        alfabetoOrdenado
          .map((s) => (s === "" ? "ε" : s).padStart(larguraCols[s]))
          .join(" | ") +
        " |"
    );

    console.log(
      "-".repeat(larguraColEstados) +
        "+" +
        alfabetoOrdenado.map((s) => "-".repeat(larguraCols[s] + 2)).join("+") +
        "+"
    );

    for (let estado of estadosOrdenados) {
      let prefixo = "";
      if (estado === this.estadoInicial) prefixo += "->";
      if (this.estadosFinais.has(estado)) prefixo += "*";

      let linha = prefixo + estado;
      linha = linha.padEnd(larguraColEstados) + " | ";

      for (let simbolo of alfabetoOrdenado) {
        const chave = [estado, simbolo].toString();
        let destinos = this.transicoes.has(chave)
          ? Array.from(this.transicoes.get(chave))
          : [];
        const celula = destinos.length > 0 ? `{${destinos.join(", ")}}` : "-";
        linha += celula.padEnd(larguraCols[simbolo]) + " | ";
      }
      console.log(linha);
    }
  }

  // Helpers para manipular sets como keys
  _setToKey(set) {
    return JSON.stringify(Array.from(set).sort());
  }

  _keyToSet(key) {
    return new Set(JSON.parse(key));
  }
}

export default AFND;
