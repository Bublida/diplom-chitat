// zipParser.ts
import { inflateRaw } from 'zlib';
import { promisify } from 'util';

const inflateRawAsync = promisify(inflateRaw);
const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const CENTRAL_DIR_SIGNATURE = 0x02014b50;

export async function extractFb2FromZip(zipBuffer: Buffer): Promise<Buffer> {
  let offset = 0;
  while (offset < zipBuffer.length) {
    const signature = zipBuffer.readUInt32LE(offset);
    if (signature !== LOCAL_FILE_HEADER_SIGNATURE) {
      if (signature === CENTRAL_DIR_SIGNATURE) break;
      offset++;
      continue;
    }

    const compressionMethod = zipBuffer.readUInt16LE(offset + 8);
    const compressedSize = zipBuffer.readUInt32LE(offset + 18);
    const uncompressedSize = zipBuffer.readUInt32LE(offset + 22);
    const fileNameLength = zipBuffer.readUInt16LE(offset + 26);
    const extraFieldLength = zipBuffer.readUInt16LE(offset + 28);
    const fileNameStart = offset + 30;
    const fileNameBuffer = zipBuffer.subarray(fileNameStart, fileNameStart + fileNameLength);
    const fileName = fileNameBuffer.toString('utf8'); // имя файла в zip — всегда в utf-8, это нормально
    const dataStart = fileNameStart + fileNameLength + extraFieldLength;

    if (fileName.toLowerCase().endsWith('.fb2')) {
      const compressedData = zipBuffer.subarray(dataStart, dataStart + compressedSize);
      if (compressionMethod === 8) {
        const decompressed = await inflateRawAsync(compressedData);
        // Возвращаем Buffer, не декодируя его в строку
        return Buffer.from(decompressed.subarray(0, uncompressedSize));
      } else if (compressionMethod === 0) {
        return Buffer.from(compressedData.subarray(0, uncompressedSize));
      } else {
        throw new Error(`Unsupported compression method: ${compressionMethod}`);
      }
    }

    offset = dataStart + compressedSize;
  }
  throw new Error('No .fb2 file found in zip archive');
}

export function isZipBuffer(buffer: Buffer): boolean {
  return buffer.length > 4 &&
         buffer[0] === 0x50 && buffer[1] === 0x4B &&
         buffer[2] === 0x03 && buffer[3] === 0x04;
}