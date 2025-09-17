import fs from "fs";

const readFile = (path, format = true) => {
  let data = [];

  try {
    const dt = fs.readFileSync(path, { encoding: "utf-8" });

    if (format)
      dt.split("\n").forEach((i) => (data = [...data, ...i.trim().split(" ")]));
    else return dt;

    return data;
  } catch (e) {
    throw e;
  }
};

export default readFile;
