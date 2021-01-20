const text = await Deno.readTextFile("./example.txt");

const lines: Array<string> = text.split("\n");
interface statement {
  Type?: string;
  name: string;
  value: Array<statement | string>;
}
let AST: Array<statement> = [];
let mode = "normal";
lines.forEach((l, n, a) => {
  if (l.match(/([A-Z]+\s)?(\w+):/)) {
    const lexems: Array<string> = l.trim().split(/([A-Z]+\s)?(\w+):/);
    console.log(lexems);
    if (lexems[1]?.trim() == "RET") {
      AST.push({
        Type: "RET",
        name: lexems[2],
        value: [lexems[3]],
      });
    }
    if (AST[AST.length - 1]?.value[0] == "") {
      mode = "def";
    }
  }
  if (l.trim() == "END") {
    mode = "normal";
  }
  if (l.match(/([A-Z]+\s)?(\w+)\s([\s\S]+),/)) {
    const lexems: Array<string> = l
      .trim()
      .split(/([A-Z]+\s)?(\w+)\s([\s\S]+),/);
    if (mode == "def") {
      if (typeof AST[AST.length - 1].value == "string") {
        AST[AST.length - 1].value = [
          {
            Type: lexems[1],
            name: lexems[2],
            value: [lexems[3]],
          },
        ];
      } else {
        AST[AST.length - 1].value.push({
          Type: lexems[1],
          name: lexems[2],
          value: [lexems[3]],
        });
      }
    } else {
      AST.push({
        Type: lexems[1],
        name: lexems[2],
        value: [lexems[3]],
      });
    }
  }
});
