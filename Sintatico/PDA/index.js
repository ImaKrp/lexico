import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

class PDA_SLR {
  constructor(dic, table, redGuide, ts) {
    this.dic = dic;
    this.table = table;
    this.redGuide = redGuide;
    this.stack = [0];
    this.ts = ts;
    this.syntax_values = [];

    const timestamp = Date.now();
    this.outputFile = `intermediate_${timestamp}.txt`;
    this.tempCount = 0;
    this.labelCount = 0;
  }

  deleteOutputFile() {
    try {
      if (fs.existsSync(this.outputFile)) {
        fs.unlinkSync(this.outputFile);
      }
    } catch (err) {
      console.log("⚠ Erro ao deletar arquivo intermediário:", err);
    }
  }

  newTemp() {
    this.tempCount++;
    return `t${this.tempCount}`;
  }

  newLabel() {
    this.labelCount++;
    return `L${this.labelCount}`;
  }

  getAction(state, symbol) {
    const col = this.dic?.[symbol];
    if (col === undefined) return null;

    const row = this.table?.[state];
    if (!row) return null;

    return row[col] || "";
  }

  formatTokenError(index, msg) {
    const t = this.ts[index] ?? {};
    return {
      line: t.line ?? -1,
      token: t.token ?? "",
      label: t.label ?? "",
      message: msg,
    };
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
        const t = this.ts[index] || {};

        const line = this.ts
          .map((v, i) => ({ ...v, i }))
          .filter(({ line }) => line === t.line);

        const stringfiedLine = line.map(({ label }) => label).join(" ");

        const expectedInsideList = ["T_,", "T_]"];

        const couldBeCommaMissing = expectedInsideList.some((tok) => {
          const col = this.dic?.[tok];
          return col !== undefined && this.table[state]?.[col];
        });

        let message = "";

        let pos = 0;

        const tokensBf = line.filter(({ i }) => i < index);

        if (tokensBf?.length > 0) {
          tokensBf.forEach((t) => {
            pos += t.label.split("").length + 1;
          });

          pos -= 1;
        }
        if (!couldBeCommaMissing) {
          pos += 1;
        }

        if (couldBeCommaMissing) {
          message = `Expected ',' before '${t.label ?? symbol}'.`;
        } else {
          message = `Unexpected '${t.label ?? symbol}'`;
        }

        message += `\n\n${stringfiedLine}`;

        message += `\n`;

        for (let j = 0; j < pos; j++) {
          message += ` `;
        }

        message += `^`;

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const absolutePath = path.join(__dirname, "../../inputs/example.in");

        message = `${absolutePath}:${t.line} - ${message}`;

        const err = {
          line: t.line ?? -1,
          token: symbol,
          label: t.label,
          message,
        };

        this.deleteOutputFile();
        return { ok: false, error: err };
      }

      if (action.startsWith("s")) {
        const nextState = parseInt(action.slice(1));
        this.stack.push(symbol);
        this.stack.push(nextState);

        const s_value = this.ts[index];
        if (["T_id", "T_num", "T_op", "T_comp_op"].includes(symbol)) {
          this.syntax_values.push({
            state: symbol,
            name: s_value?.label ?? symbol,
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
          const err = this.formatTokenError(
            index,
            `Erro no GOTO após reduzir '${gen}'`
          );

          console.log("❌", err.message);
          this.deleteOutputFile();
          return { ok: false, error: err };
        }

        this.stack.push(gen);
        this.stack.push(parseInt(gotoAction));

        this.generateIntermediate(gen);
      } else if (action === "acc") {
        return { ok: true, error: null };
      } else {
        const err = this.formatTokenError(index, `Ação inválida '${action}'`);

        console.log("❌", err.message);
        this.deleteOutputFile();
        return { ok: false, error: err };
      }
    }
  }

  generateIntermediate(gen) {
    let code = "";

    if (gen === "Expressao") {
      const last = this.syntax_values.length;
      const right = this.syntax_values[last - 1];
      const op = this.syntax_values[last - 2];
      const left = this.syntax_values[last - 3];

      if (
        left?.name &&
        right?.name &&
        op &&
        (op.state === "T_op" || op.state === "T_comp_op")
      ) {
        const t = this.newTemp();
        code = `${t} = ${left.name} ${op.name} ${right.name}`;

        this.syntax_values.splice(last - 3, 3, { state: "Expressao", name: t });
      } else if (right?.name) {
        this.syntax_values.splice(last - 1, 1, {
          state: "Expressao",
          name: right.name,
        });
      }
    }

    if (gen === "Atribuicao") {
      const expr = this.syntax_values.pop();
      this.syntax_values.pop();
      const id = this.syntax_values.pop();

      if (id?.name && expr?.name) {
        code = `${id.name} = ${expr.name}`;
        this.syntax_values.push({
          state: "Atribuicao",
          name: expr.name,
          label: id.name,
        });
      }
    }

    if (code) {
      fs.appendFileSync(this.outputFile, code + "\n");
    }
  }
}

export default PDA_SLR;
