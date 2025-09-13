import fs from "fs";

const readFile = (path) => {
  let data = [];

  try {
    const dt = fs.readFileSync(path, { encoding: "utf-8" });
    dt.split("\n").forEach((i) => (data = [...data, ...i.trim().split(" ")]));

    return data;
  } catch (e) {
    throw e;
  }
};

export default readFile;
