function get_translated(s, t, show_status = true) {
  if (t?.[s]) return show_status ? t[s]: t[s].replace("*","");

  return s;
}

function show_table(AFD, translater) {
  console.log(
    `${"".padStart(6)}   |${[...AFD.alphabet.values()]
      .map((c) => String(c).padStart(6))
      .join("   |")}   |`
  );
  [...AFD.states.values()].forEach((s) => {
    console.log(
      `${get_translated(String(s), translater).padStart(6)}   |${[
        ...AFD.alphabet.values(),
      ]
        .map((c) =>
          get_translated(
            [...AFD.transitions.get(`${String(s)},${String(c)}`)][0],
            translater,
            false
          ).padStart(6)
        )
        .join("   |")}   |`
    );
  });
}

export default show_table;
