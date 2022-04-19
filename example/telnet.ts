import { Receiver, Sender } from "../mod.ts";

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
