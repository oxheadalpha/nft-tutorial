import pinataSDK from '@pinata/sdk';
import fs from 'fs';

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