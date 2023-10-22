// queryDispatchEvents.ts

import { BigNumber, BigNumberish, ethers } from "ethers";
import fs from 'fs';
import path from 'path';
import os from 'os';
import { MailBox } from "../lib/MailBox";
import { AbiCoder, Bytes, hexValue, hexlify, parseEther } from "ethers/lib/utils";
import { MatchingListElement } from "./readMatchingListElement";
import dotenv from "dotenv";

dotenv.config();

let QUERY_LIMIT = 5000;
const QUERY_CHUNK = 2500;

type UserMessage = {
  sender: string;
  destination: string;
  recipient: string;
  message: string;
};

let userMessages: Array<UserMessage> = [];

export async function queryDispatchEvents(matchingList: MatchingListElement, depth: number, filename: string) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_AVALANCHE);
  const contractAddress = MailBox.avalanche.address;
  const dispatchEventSignatureHash = ethers.utils.id("Dispatch(address,uint32,bytes32,bytes)");
  const currentBlockNumber = await provider.getBlockNumber();

  let filter: ethers.providers.Filter = {
    address: contractAddress,
    fromBlock: currentBlockNumber - 2500,
    toBlock: currentBlockNumber,
    topics: [dispatchEventSignatureHash]
  };

  const iface = new ethers.utils.Interface(MailBox.avalanche.abi);
  console.log("Looking at the last " + depth + " blocks... (this might take a bit!)");

  for (let index = 0; index < QUERY_LIMIT / QUERY_CHUNK; index++) {
    filter.fromBlock = currentBlockNumber - QUERY_LIMIT + index * QUERY_CHUNK;
    filter.toBlock = filter.fromBlock + QUERY_CHUNK;
    let logArray = await provider.getLogs(filter);
    await sleep(250);

    logArray.forEach(log => {
      const decodedLog = iface.parseLog(log);
      let args = decodedLog.args;
      const message = args.message;
      const newByteArray = ethers.utils.arrayify(message);
      const utf8String = new TextDecoder("utf-8").decode(new Uint8Array(newByteArray));

      const userMessage: UserMessage = {
        "sender": args.sender,
        "destination": args.destination,
        "recipient": "0x" + args.recipient.slice(-39),
        "message": utf8String.trim(),
      }
      userMessages.push(userMessage);
    });
  }

  logMessages()

  if (filename != undefined) {
    saveMessages(filename);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logMessages() {
  userMessages.forEach(userMessage => {
    console.log("***MESSAGE***");
    console.log("sender (Address): ", userMessage.sender);
    console.log("destination (Chain ID): ", userMessage.destination);
    console.log("recipient (address): ", userMessage.recipient);
    console.log("message: ", userMessage.message);
    console.log("");
  });
}
function saveMessages(filename: string) {
  const expandedPath = filename.replace(/^~(?=$|\/|\\)/, os.homedir());

  const jsonContent = JSON.stringify(userMessages, null, 2);
  fs.writeFileSync(expandedPath, jsonContent, 'utf8');

  const absolutePath = path.resolve(expandedPath);
  console.log(`File saved at: ${absolutePath}`);
}


