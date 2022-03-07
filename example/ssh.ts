import { Receiver, Sender } from "../mod.ts";

const proc = Deno.run({
  cmd: ["ssh", "-tt", "localhost", "/bin/sh"],
  stdin: "piped",
  stdout: "piped",
});
const receiver = new Receiver(proc.stdout);
const sender = new Sender(proc.stdin);
const prompt = /.*\$ $/;
await receiver.wait(prompt);
await sender.send("ls -al\n");
const received = await receiver.recv(prompt);
await sender.send("exit\n");
await proc.status();
proc.close();

console.log("-".repeat(80));
console.log(received);
console.log("-".repeat(80));
