const DEFAULT_CHUNK_SIZE = 2 ** 10;

export class Receiver {
  #reader: Deno.Reader;
  #decoder: TextDecoder;

  constructor(reader: Deno.Reader) {
    this.#reader = reader;
    this.#decoder = new TextDecoder();
  }

  async recv(pattern: RegExp, chunkSize = DEFAULT_CHUNK_SIZE): Promise<string> {
    const chunks: string[] = [];
    await this.wait(pattern, chunkSize, (c) => chunks.push(c));
    return chunks.join("");
  }

  async wait(
    pattern: RegExp,
    chunkSize = DEFAULT_CHUNK_SIZE,
    callback?: (chunk: string) => void,
  ): Promise<void> {
    const chunk = new Uint8Array(chunkSize);
    while (true) {
      const n = await this.#reader.read(chunk);
      if (n == null) {
        return;
      }
      const t = this.#decoder.decode(chunk.subarray(0, n));
      if (callback) {
        callback(t);
      }
      if (pattern.test(t)) {
        return;
      }
    }
  }
}
