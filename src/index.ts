import { cac } from "cac";

const cli = cac();

cli
  .command("hello [name]", "向你打招呼")
  .action((name: string = "world") => {});

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
