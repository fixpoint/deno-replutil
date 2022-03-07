import { writeAll } from "https://deno.land/std@0.128.0/streams/mod.ts";

export class Sender {
  #writer: Deno.Writer;
  #encoder: TextEncoder;

  constructor(writer: Deno.Writer) {
    this.#writer = writer;
    this.#encoder = new TextEncoder();
  }

  send(message: string): Promise<void> {
    const data = this.#encoder.encode(message);
    return writeAll(this.#writer, data);
  }
}
