const encoder = new TextEncoder();
const decoder = new TextDecoder();

const conn = await Deno.connect({ hostname: "127.0.0.1", port: 8080 });
for (;;) {
  // Write to the server
  const msg = {
    hello: "world ! ! !",
  };
  conn.write(encoder.encode(JSON.stringify(msg)));
  // Read response
  const buf = new Uint8Array(1024);
  await conn.read(buf);
  console.log("Client - Response:", decoder.decode(buf));
}
