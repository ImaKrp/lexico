import read from "../../utils/read.js";
import { JSDOM } from "jsdom";

const getSlr = () => {
  const html = read("./inputs/slr.html", false);
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const headerRow = document.querySelector(
    "#lrTableView table thead tr:last-child"
  );
  const headers = Array.from(headerRow.querySelectorAll("th")).map((th) =>
    th.textContent.trim()
  );

  const dic = Object.fromEntries(headers.map((h, i) => [h, i]));

  const rows = document.querySelectorAll("#lrTableView table tbody tr");

  const table = Array.from(rows).map((tr) =>
    Array.from(tr.querySelectorAll("td"))
      .slice(1)
      .map((td) => td.textContent.trim().replace(/\s+/g, ""))
  );

  const grammar = read("./inputs/AnalyticGrammar.txt", false);

  const redGuide = grammar
    .split("\n")
    .filter((txt) => txt)
    .map((txt) => {
      const getSize = (labels) => {
        return [gen.trim(), labels?.length ? labels.split(" ").length * 2 : 0];
      };

      let [gen, temp] = txt.split(" -> ");

      temp = temp.trim();

      if (temp !== "''") return getSize(temp);
      return getSize("");
    });

  return { dic, table, redGuide };
};

export default getSlr;
