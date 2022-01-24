import pinataSDK from '@pinata/sdk';
import fs from 'fs';

/**
 * Pin local file to IPFS using Pinata API
 * @param apiKey Pinata account API key
 * @param secretKey Pinata account secret key
 * @param name pinned file name on IPFS
 * @param filePath path to a local file to be pinned
 * @returns IPFS hash (CID) for a pinned file
 */
export async function pinFile(
  apiKey: string,
  secretKey: string,
  name: string,
  filePath: string
): Promise<string> {
  const pinataClient = pinataSDK(apiKey, secretKey);
  const stream = fs.createReadStream(filePath);
  const response = await pinataClient.pinFileToIPFS(stream, {
    pinataMetadata: {name}
  });
  return response.IpfsHash;
}

/**
 * Pin local directory to IPFS using Pinata API
 * @param apiKey Pinata account API key
 * @param secretKey Pinata account secret key
 * @param name pinned directory name on IPFS
 * @param dirPath path to a local directory to be pinned
 * @returns IPFS hash (CID) for a pinned directory
 */
export async function pinDirectory(
  apiKey: string,
  secretKey: string,
  name: string,
  dirPath: string
): Promise<string> {
  const pinataClient = pinataSDK(apiKey, secretKey);
  const response = await pinataClient.pinFromFS(dirPath, {
    pinataMetadata: {name}
  });
  return response.IpfsHash;
}