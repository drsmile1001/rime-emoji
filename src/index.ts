import { cac } from "cac";
import { greet } from "./funcs/Greet";

const cli = cac();

cli.command("hello [name]", "向你打招呼").action((name: string = "world") => {
  greet(name);
});

cli.help();
cli.parse(process.argv, { run: false });

if (!cli.matchedCommand) {
  cli.outputHelp();
  process.exit(0);
}

try {
  await cli.runMatchedCommand();
} catch (error) {
  console.error(error);
  process.exit(1);
}
