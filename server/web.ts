const listener = Deno.listen({ port: 8080, hostname: "127.0.0.1" });
const encoder = new TextEncoder();
let connections: Deno.Conn[] = [];
const text = (data: Uint8Array) => {
  const decoder = new TextDecoder();
  return decoder.decode(data).replace(/\u0000/g, "");
};
const handle_conn = async (conn: Deno.Conn) => {
  let buffer = new Uint8Array(1024);
  while (true) {
    const count = await conn.read(buffer);
    console.log(count);
    if (!count) {
      const index = connections.indexOf(conn);
      connections.splice(index, 1);
      break;
    } else {
      const msg = JSON.parse(text(buffer));
      console.log(msg);
    }
  }
};
for await (const conn of listener) {
  connections.push(conn);
  handle_conn(conn);
}
