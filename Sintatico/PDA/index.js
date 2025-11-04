class PDA_SLR {
  constructor(dic, table, redGuide, ts) {
    this.dic = dic;
    this.table = table;
    this.redGuide = redGuide;
    this.stack = [0];
    this.ts = ts;
    this.syntax_values = [];
  }

  getAction(state, symbol) {
    const col = this.dic[symbol];
    if (col === undefined) return null;
    return this.table[state][col] || "";
  }

  run(tokens, debug = false) {
    const input = [...tokens, "$"];
    let index = 0;
    this.stack = [0];

    while (true) {
      const state = this.stack[this.stack.length - 1];
      const symbol = input[index];
      const action = this.getAction(state, symbol);

      if (debug) {
        console.log(`\n[DEBUG] Pilha: [${this.stack.join(", ")}]`);
        console.log(`[DEBUG] Próximo símbolo: ${symbol}`);
        console.log(`[DEBUG] Ação: ${action || "(vazia)"}`);
      }

      if (!action) {
        console.log(
          `❌ Erro: nenhuma ação para estado ${state} e símbolo '${symbol}'`
        );
        return false;
      }

      if (action.startsWith("s")) {
        const nextState = parseInt(action.slice(1));
        this.stack.push(symbol);
        this.stack.push(nextState);

        const s_value = this.ts[index];

        if (["T_id", "T_num", "T_op", "T_comp_op"].includes(symbol)) {
          this.syntax_values.push({
            state: symbol,
            name: symbol === "T_num" ? Number(s_value.label) : s_value.label,
          });
        } else {
          this.syntax_values.push({ state: symbol });
        }

        index++;
      } else if (action.startsWith("r")) {
        const ruleIndex = parseInt(action.slice(1));
        const [gen, popCount] = this.redGuide[ruleIndex];

        for (let i = 0; i < popCount; i++) this.stack.pop();

        const topState = this.stack[this.stack.length - 1];

        const gotoAction = this.getAction(topState, gen);
        if (!gotoAction) {
          console.log(`❌ Erro no GOTO após reduzir '${gen}'`);
          return false;
        }

        this.stack.push(gen);
        this.stack.push(parseInt(gotoAction));

        if (debug) console.log(`[REDUCE] Regra ${ruleIndex} → ${gen}`);
      } else if (action === "acc") {
        console.log("✅ Cadeia aceita!");
        return true;
      } else {
        console.log(`❌ Ação inválida: '${action}'`);
        return false;
      }
    }
  }
}

export default PDA_SLR;
