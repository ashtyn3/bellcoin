const text = await Deno.readTextFile("./example.txt");

const lines: Array<string> = text.split("\n");
interface statement {
  Type?: string;
  name: string;
  value: string | Array<string>;
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
        value: lexems[3],
      });
    }
    console.log(AST);
    if (AST[AST.length - 1]?.value == "") {
      mode = "def";
    }
  }
  if (l.match(/([A-Z]+\s)?(\w+)\s([\s\S]+),/)) {
    const lexems: Array<string> = l
      .trim()
      .split(/([A-Z]+\s)?(\w+)\s([\s\S]+),/);
    if (mode == "def") {
      AST.push({
        Type: lexems[1],
      });
    }
  }
});
