// readMatchingListElement.ts

import fs from 'fs';

export interface MatchingListElement {
  originDomain?: '*' | number | number[];
  senderAddress?: '*' | string | string[];
  destinationDomain?: '*' | number | number[];
  recipientAddress?: '*' | string | string[];
}

export async function readMatchingListElement(filePath: string) {
  const jsonData: string = fs.readFileSync(filePath, 'utf-8');
  const data: MatchingListElement = JSON.parse(jsonData);

  return (data);
}
