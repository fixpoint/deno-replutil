import { Receiver, Sender } from "../mod.ts";

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
