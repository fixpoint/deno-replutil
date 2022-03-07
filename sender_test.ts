import { assertEquals, io, streams } from "./deps_test.ts";
import { Sender } from "./sender.ts";

const decoder = new TextDecoder();

Deno.test("Sender.send()", async (t) => {
  await t.step("writes entire message to the writer", async () => {
    const writer = new io.Buffer();
    const sender = new Sender(writer);
    await sender.send("Hello world\n");
    assertEquals(
      decoder.decode(await streams.readAll(writer)),
      "Hello world\n",
    );
  });

  await t.step(
    "writes entire message to the writer multiple times",
    async () => {
      const writer = new io.Buffer();
      const sender = new Sender(writer);
      await sender.send("Hello world\n");
      await sender.send("Hello world\n");
      await sender.send("Hello world\n");
      assertEquals(
        decoder.decode(await streams.readAll(writer)),
        "Hello world\nHello world\nHello world\n",
      );
    },
  );
});
