import read from "../../utils/read.js";

const otimizer = (file) => {
  if (!file) throw Error("File name expected");
  try {
    const intermediate = read(`./${file}`, false);

    const lines = intermediate
      .split("\n")
      .map((txt) => txt.trim())
      .filter((txt) => /^t\d+$/.test(txt.split(" = ")[0]));

    let is_a_dep_of = {};
    let temps = [];

    lines.forEach((line) => {
      const [temp, splitted] = line.split(" = ");
      const [op1, _, op2] = splitted.split(" ");

      temps.push(temp);

      const includeDep = (dep, of_) => {
        if (!is_a_dep_of?.[dep]) {
          is_a_dep_of[dep] = [];
        }

        is_a_dep_of[dep] = [...is_a_dep_of[dep], of_];
      };

      if (/^t\d+$/.test(op1)) {
        includeDep(op1, temp);
      }
      if (/^t\d+$/.test(op2)) {
        includeDep(op2, temp);
      }
    });

    const L = [];

    temps = temps.sort();

    for (let i = 0; i < lines.length; i++) {
      for (let j = 0; j < temps.length; j++) {
        const curr_t = temps[j];
        if (is_a_dep_of?.[curr_t]) {
          if (!is_a_dep_of?.[curr_t].every((item) => L.includes(item)))
            continue;
        }
        L.push(curr_t);
        temps.splice(j, 1);
        break;
      }
    }

    return L;
  } catch (e) {
    console.log(e);
  }
};

export default otimizer;
// tX  =   X  " "op" "  Y
//    ˆˆˆ
