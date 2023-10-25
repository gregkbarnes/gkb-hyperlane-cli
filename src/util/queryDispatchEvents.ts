// queryDispatchEvents.ts

import fs from 'fs';
import path from 'path';
import os from 'os';
import dotenv from "dotenv";
import { ethers } from "ethers";
import { MailBox } from "../lib/MailBox";
import { MatchingListElement } from "./readMatchingListElement";

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
let senderAddresses: string[] = [];

export async function queryDispatchEvents(matchingList: MatchingListElement, rpcUrl: string, depth: number, filename: string) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const dispatchEventSignatureHash = ethers.utils.id("Dispatch(address,uint32,bytes32,bytes)");

  let contractAddress;
  let contractAbi;

  if (typeof matchingList.senderAddress == 'string') {
    senderAddresses.push(matchingList.senderAddress);
  } else if (matchingList.senderAddress != undefined) {
    senderAddresses = matchingList.senderAddress;
  }

  senderAddresses.forEach((addr, index) => {
    senderAddresses[index] = ethers.utils.hexZeroPad(addr, 32);
  });

  try {
    const originChain = matchingList.originDomain;

    switch (originChain) {
      case MailBox.arbitrum.domain:
        contractAddress = MailBox.arbitrum.address;
        contractAbi = MailBox.arbitrum.abi;
        break;
      case MailBox.avalanche.domain:
        contractAddress = MailBox.avalanche.address;
        contractAbi = MailBox.avalanche.abi
        break;
      case MailBox.bsc.domain:
        contractAddress = MailBox.bsc.address;
        contractAbi = MailBox.bsc.abi
        break;
      case MailBox.celo.domain:
        contractAddress = MailBox.celo.address;
        contractAbi = MailBox.celo.abi
        break;
      case MailBox.ethereum.domain:
        contractAddress = MailBox.ethereum.address;
        contractAbi = MailBox.ethereum.abi
        break;
      case MailBox.optimism.domain:
        contractAddress = MailBox.optimism.address;
        contractAbi = MailBox.optimism.abi
        break;
      case MailBox.polygon.domain:
        contractAddress = MailBox.polygon.address;
        contractAbi = MailBox.polygon.abi
        break;
      case MailBox.moonbeam.domain:
        contractAddress = MailBox.moonbeam.address;
        contractAbi = MailBox.moonbeam.abi
        break;
      case MailBox.gnosis.domain:
        contractAddress = MailBox.gnosis.address;
        contractAbi = MailBox.gnosis.abi
        break;
      default:
        throw new Error("Invalid originChain");
    }
  } catch (error) {
    console.log(error);
  }

  const currentBlockNumber = await provider.getBlockNumber();

  let filter: ethers.providers.Filter = {
    address: contractAddress,
    fromBlock: currentBlockNumber - 2500,
    toBlock: currentBlockNumber,
    topics: [
      dispatchEventSignatureHash,
      senderAddresses,
    ]
  };

  const iface = new ethers.utils.Interface(contractAbi!);
  console.log("Looking at the last " + depth + " blocks... (this might take a bit!)");

  for (let index = 0; index < QUERY_LIMIT / QUERY_CHUNK; index++) {
    filter.fromBlock = currentBlockNumber - QUERY_LIMIT + index * QUERY_CHUNK;
    filter.toBlock = filter.fromBlock + QUERY_CHUNK;
    try {
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
    } catch (error) {
      console.log("Error getting logs - ", error);
    }
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


