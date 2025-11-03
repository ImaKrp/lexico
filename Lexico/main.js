import lexic from "./index.js";
const { tape, ts } = lexic();

console.log(`\n\n${tape.join(" ")}\n`);
ts.forEach((txt) =>
  console.log(
    `${String(txt.line).padStart(4)} | ${String(txt.token).padStart(
      14
    )} | ${String(txt.label).padEnd(20)}`
  )
);

export default lexic;
