import { assertEquals, delay, io, streams } from "./deps_test.ts";
import { Receiver } from "./receiver.ts";

const encoder = new TextEncoder();

class Channel implements Deno.Reader, Deno.Writer, Deno.Closer {
  #buffer: io.Buffer;
  #closed: boolean;

  constructor() {
    this.#buffer = new io.Buffer();
    this.#closed = false;
  }

  async read(p: Uint8Array): Promise<number | null> {
    while (true) {
      const n = this.#buffer.readSync(p);
      if (n == null) {
        if (this.#closed) {
          return null;
        }
        await delay(0);
        continue;
      }
      return n;
    }
  }

  write(p: Uint8Array): Promise<number> {
    return this.#buffer.write(p);
  }

  close(): void {
    this.#closed = true;
  }
}

Deno.test("Receiver.wait()", async (t) => {
  await t.step("waits until the pattern is received", async () => {
    const reader = new Channel();
    const receiver = new Receiver(reader);

    let complete = false;

    const producer = async () => {
      await streams.writeAll(reader, encoder.encode("Hello world\n"));
      await streams.writeAll(reader, encoder.encode("Hello world\n"));
      await streams.writeAll(reader, encoder.encode("Hello world\n"));
      await delay(100);
      complete = true;
      await streams.writeAll(reader, encoder.encode("john@debian$ "));
      reader.close();
    };
    const consumer = async () => {
      await receiver.wait(/.+\$ $/);
      assertEquals(complete, true);
    };
    await Promise.all([producer(), consumer()]);
  });
});

Deno.test("Receiver.recv()", async (t) => {
  await t.step("receives data until the pattern is received", async () => {
    const reader = new Channel();
    const receiver = new Receiver(reader);

    const producer = async () => {
      await streams.writeAll(reader, encoder.encode("Hello world\n"));
      await streams.writeAll(reader, encoder.encode("Hello world\n"));
      await streams.writeAll(reader, encoder.encode("Hello world\n"));
      await delay(100);
      await streams.writeAll(reader, encoder.encode("john@debian$ "));
      reader.close();
    };
    const consumer = async () => {
      const received = await receiver.recv(/.+\$ $/);
      assertEquals(
        received,
        "Hello world\nHello world\nHello world\njohn@debian$ ",
      );
    };
    await Promise.all([producer(), consumer()]);
  });
});
