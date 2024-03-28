import { delay } from "https://deno.land/std@0.221.0/async/mod.ts";

const DEFAULT_PATTERN = /\n/m;

const DEFAULT_INTERVAL = 100;

const DEFAULT_CHUNK_SIZE = 2 ** 10;

export type ReceiverOptions = {
  pattern?: RegExp;
  interval?: number;
  chunkSize?: number;
};

export class Receiver {
  #reader: Deno.Reader;
  #decoder: TextDecoder;
  #remains: string;
  #options: ReceiverOptions;

  constructor(reader: Deno.Reader, options: ReceiverOptions = {}) {
    this.#reader = reader;
    this.#decoder = new TextDecoder();
    this.#remains = "";
    this.#options = options;
    if (this.#options.pattern) {
      validatePattern(this.#options.pattern);
    }
  }

  async recv(
    pattern?: RegExp,
    interval?: number,
    chunkSize?: number,
  ): Promise<string> {
    pattern = pattern ?? this.#options.pattern ?? DEFAULT_PATTERN;
    interval = interval ?? this.#options.interval ?? DEFAULT_INTERVAL;
    chunkSize = chunkSize ?? this.#options.chunkSize ?? DEFAULT_CHUNK_SIZE;

    validatePattern(pattern);
    validateInterval(interval);
    validateChunkSize(chunkSize);

    const chunk = new Uint8Array(chunkSize);
    let text = this.#remains;
    while (true) {
      const m = text.match(pattern);
      if (m) {
        const index = m.index! + m[0].length;
        this.#remains = text.substring(index);
        return text.substring(0, index);
      }
      const n = await this.#reader.read(chunk);
      if (n == null) {
        return text;
      } else if (n === 0) {
        await delay(interval);
      } else {
        text += this.#decoder.decode(chunk.subarray(0, n));
      }
    }
  }
}

function validatePattern(pattern: RegExp): void {
  if (pattern.flags.indexOf("g") !== -1) {
    throw new Error("Global RegExp pattern is not allowed");
  }
}

function validateInterval(interval: number): void {
  if (interval <= 0) {
    throw new Error("The interval must be a positive integer");
  }
}

function validateChunkSize(chunkSize: number): void {
  if (chunkSize <= 0) {
    throw new Error("The chunkSize must be a positive integer");
  }
}
