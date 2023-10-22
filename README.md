# gkb-hyperlane-cli

A simple yargs-based (node) CLI tool written in typescript for [hyperlane.xyz](https://hyperlane.xyz).

## Building the project
### Transpile to JavaScript in `./dist/`:
`yarn build`
## Continuous building
### Monitors for changes to ./src/ and automatically transpiles to js in `./dist/`:
 `yarn watch`
## Run the CLI
### Run CLI client (Nodejs must be installed):
 `yarn start [command] <args>...`
### Commands
  `yarn start dispatch`                         *Dispatch a cross-chain message<br>*
  <MatchingListElement_Filepath> <RPC_URL> <message> <private_key><br>
  `yarn start query`                            *View messages sent from target MailBox*<br>
  <MatchingListElement_Filepath> <RPC_URL> <depth> <save_file_path><br>
Options:<br>
  --help     Show help                                                 [boolean]<br>
  --version  Show version number                                       [boolean]<br>
