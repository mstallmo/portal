import { FileContent, FileContentHeader } from "./index";

const textDecoder = new TextDecoder();

/**
 * Parses a raw ArrayBuffer into a FileContent object using a custom binary protocol.
 * This protocol enables JSON serialized data and binary data to be passed in the same buffer.
 *
 * The protocol follows a simple <header size><header><content> structure. The first 8 bytes are the size of the
 * header as a u64. The next bytes from 8 to header length are the header itself as a JSON serialized string.
 * The remaining bytes from 8 + header length to the end of the buffer are the content itself.
 *
 * @param {ArrayBuffer} data - ArrayBuffer containing the encoded file content
 * @returns {FileContent}
 */
export function parseRaw(data: ArrayBuffer): FileContent {
  const dv = new DataView(data);
  // Get length of header in bytes as u64
  const headerLength = dv.getBigUint64(0);
  // Compute the start of the file data (header length in bytes plus 8 -- the size in bytes of the value of the header length).
  // NOTE: The `Number` conversion here may cause issues if the header length value is larger than 2^53. This is extremely
  // unlikely in practice but is true none the less.
  const dataStart = Number(headerLength) + 8;

  // Decode the header into a UTF-8 string
  const header: FileContentHeader = JSON.parse(
    textDecoder.decode(dv.buffer.slice(8, dataStart)),
  );

  // Slice the file content from the header
  const content = dv.buffer.slice(dataStart);

  return { header, data: content };
}
