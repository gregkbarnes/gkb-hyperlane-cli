#! /usr/bin/env node

import yargs from 'yargs';
import { dispatchTransaction } from './util/dispatchTransaction';
import { queryDispatchEvents } from './util/queryDispatchEvents';
import { MatchingListElement, readMatchingListElement } from './util/readMatchingListElement';

yargs
  .command('dispatch <MatchingListElement_Filepath> <RPC_URL> <message> <private_key>', 'Dispatch a cross-chain message!', (yargs) => {
    yargs.positional('MatchingListElement_Filepath', {
      describe: 'Path to valid MatchingListElement.json input\nhttps://github.com/hyperlane-xyz/hyperlane-monorepo/blob/465112db6fddb3b598d6da39c13491ff1bc7e700/typescript/infra/src/config/agent/relayer.ts#L19',
      type: 'string',
    }),
      yargs.positional('RPC_URL', {
        describe: 'URL of RPC corresponding to origin chain (IE: https://rpc.ankr.com/eth)',
        type: 'string',
      }),
      yargs.positional('message', {
        describe: 'Private key',
        type: 'string',
      }),
      yargs.positional('private_key', {
        describe: 'Message you want to send with Hyperlane',
        type: 'string',
      });
  }, async (argv) => {
    const matchingListElement: MatchingListElement = await readMatchingListElement(argv.MatchingListElement_Filepath as string);
    dispatchTransaction(
      matchingListElement.originDomain as number, // originChain: number,
      matchingListElement.destinationDomain as number,// destination: ethers.BigNumberish,
      matchingListElement.recipientAddress as string,// recipient: ethers.utils.BytesLike,
      argv.RPC_URL as string,
      argv.private_key as string,
      argv.message as string,
    )
  })
  .command('query <MatchingListElement_Filepath> <depth> <save_file_path>', 'View messages sent from target MailBox!', (yargs) => {
    yargs.positional('MatchingListElement_Filepath', {
      describe: 'Path to valid MatchingListElement.json input\nhttps://github.com/hyperlane-xyz/hyperlane-monorepo/blob/465112db6fddb3b598d6da39c13491ff1bc7e700/typescript/infra/src/config/agent/relayer.ts#L19',
      type: 'string'
    }),
      yargs.positional('depth', {
        describe: 'Number of blocks to query (prior to current block).',
        type: 'number'
      }),
      yargs.positional('save_file_path', {
        describe: 'Path to save messages (/home/user/myHyperlaneMessages.json).',
        type: 'string'
      });
  }, async (argv) => {
    const matchingListElement: MatchingListElement = await readMatchingListElement(argv.MatchingListElement_Filepath as string);
    queryDispatchEvents(matchingListElement, argv.depth as number, argv.save_file_path as string)
  })
  .argv;
