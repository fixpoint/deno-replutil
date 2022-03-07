import { Receiver, Sender } from "../mod.ts";

const username = "johntitor";
const password = "steinsgate";

const proc = Deno.run({
  cmd: ["telnet", "localhost"],
  stdin: "piped",
  stdout: "piped",
});
const receiver = new Receiver(proc.stdout);
const sender = new Sender(proc.stdin);

await receiver.wait(/login: $/);
await sender.send(`${username}\n`);

await receiver.wait(/Password:$/);
await sender.send(`${password}\n`);

const prompt = /.* % /;
await receiver.wait(prompt);
await sender.send("ls -al\n");
const received = await receiver.recv(prompt);
await sender.send("exit\n");
await proc.status();
proc.close();

console.log("-".repeat(80));
console.log(received);
console.log("-".repeat(80));
