// dispatchTransaction.ts

import { ethers } from "ethers";
import { MailBox } from "../lib/MailBox";
import dotenv from "dotenv";

dotenv.config();

export async function dispatchTransaction(
  originChain: number,
  destination: ethers.BigNumberish,
  recipient: ethers.utils.BytesLike,
  rpcUrl: string,
  privateKey: string,
  body: string,
) {

  let provider;
  recipient = ethers.utils.hexZeroPad(recipient, 32);
  body = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(body));

  if (rpcUrl != undefined) {
    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  // create logic to convert originChain to contractAddress
  let contractAddress: string;
  let contractAbi;
  let mailbox: typeof MailBox;

  try {
    switch (originChain) {
      case MailBox.arbitrum.domain:
        contractAddress = MailBox.arbitrum.address;
        contractAbi = MailBox.arbitrum.abi;
        break;
      case MailBox.avalanche.domain:
        contractAddress = MailBox.avalanche.address;
        contractAbi = MailBox.avalanche.abi
        break;
      default:
        throw new Error("Invalid originChain");
    }
    provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey).connect(provider);
    const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

    try {
      console.log("Sending Transaction. Please wait...");
      const txResponse = await contract.dispatch(destination, recipient, body);
      console.log(`Transaction hash: ${txResponse.hash}`);
      console.log("Almost there. Just waiting for confirmation...");
      const receipt = await txResponse.wait();
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

      return receipt;
    } catch (error) {
      console.error(`Transaction failed: ${error}`);
      return null;
    }
  } catch (error) {
    console.log(error);
  }
}