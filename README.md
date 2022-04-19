# replutil

[![npm](http://img.shields.io/badge/available%20on-npm-lightgrey.svg?logo=npm&logoColor=white)](https://www.npmjs.com/package/replutil)
[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/replutil)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/replutil/mod.ts)
[![Test](https://github.com/fixpoint/deno-replutil/workflows/Test/badge.svg)](https://github.com/fixpoint/deno-replutil/actions?query=workflow%3ATest)
[![npm version](https://badge.fury.io/js/replutil.svg)](https://badge.fury.io/js/replutil)

REPL (Read-eval-print loop) utilities.

## Usage

Use `Sender` to send message to REPL and `Receiver` to receive message from
REPL.

##### SSH

```typescript
import { Receiver, Sender } from "./mod.ts";

const proc = Deno.run({
  cmd: ["ssh", "-tt", "localhost", "/bin/sh"],
  stdin: "piped",
  stdout: "piped",
});
const receiver = new Receiver(proc.stdout, {
  pattern: /.*\$ $/,
});
const sender = new Sender(proc.stdin);
await receiver.recv();
await sender.send("ls -al\n");
const received = await receiver.recv();
await sender.send("exit\n");
await proc.status();
proc.close();

console.log("-".repeat(80));
console.log(received);
console.log("-".repeat(80));
```

##### Telnet

```typescript
import { Receiver, Sender } from "./mod.ts";

const username = "johntitor";
const password = "steinsgate";

const proc = Deno.run({
  cmd: ["telnet", "localhost"],
  stdin: "piped",
  stdout: "piped",
});
const receiver = new Receiver(proc.stdout, {
  pattern: /.* % /,
});
const sender = new Sender(proc.stdin);

await receiver.recv(/login: $/);
await sender.send(`${username}\n`);

await receiver.recv(/Password:$/);
await sender.send(`${password}\n`);

await receiver.recv();
await sender.send("ls -al\n");
const received = await receiver.recv();
await sender.send("exit\n");
await proc.status();
proc.close();

console.log("-".repeat(80));
console.log(received);
console.log("-".repeat(80));
```

## Development

Lint code like:

```text
make lint
```

Format code like

```text
make fmt
```

Check types like

```text
make type-check
```

Run tests like:

```text
make test
```

## License

The code follows MIT license written in [LICENSE](./LICENSE). Contributors need
to agree that any modifications sent in this repository follow the license.
