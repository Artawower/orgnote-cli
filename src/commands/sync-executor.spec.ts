import { expect, test, vi } from 'vitest';
import { hashContent, type FileSystem, type RemoteFile } from 'orgnote-api';
import { createExecutor } from './sync.js';
import type { Api } from './sdk.js';

const remoteFile: RemoteFile = {
  path: '/.orgnote/config.toml',
  version: 2,
  deleted: false,
  updatedAt: '2024-01-01T00:00:00Z',
};

const createDownloadResponse = async (content: Uint8Array, hasContentHash = true) => ({
  data: content.buffer,
  status: 200,
  headers: {
    'content-type': 'application/octet-stream',
    ...(hasContentHash ? { 'x-content-hash': await hashContent(content) } : {}),
  },
});

test('createExecutor fetchContent reads remote bytes without writing locally', async () => {
  const content = new TextEncoder().encode('remote');
  const response = await createDownloadResponse(content);
  const downloadFile = vi.fn(async () => response);
  const api = { sync: { downloadFile } } as unknown as Api;
  const fs = { writeFile: vi.fn(async () => undefined) } as unknown as FileSystem;
  const executor = createExecutor(api, '/vault', fs);

  const result = await executor.fetchContent(remoteFile);

  expect(result).toEqual(content);
  expect(downloadFile).toHaveBeenCalledWith(remoteFile.path);
  expect(fs.writeFile).not.toHaveBeenCalled();
});

test('createExecutor rejects response without content hash before writing locally', async () => {
  const content = new TextEncoder().encode(
    '<!doctype html><html><head><title>orgnote</title></head></html>',
  );
  const response = await createDownloadResponse(content, false);
  const downloadFile = vi.fn(async () => response);
  const api = { sync: { downloadFile } } as unknown as Api;
  const fs = { writeFile: vi.fn(async () => undefined) } as unknown as FileSystem;
  const executor = createExecutor(api, '/vault', fs);

  await expect(executor.download(remoteFile)).rejects.toMatchObject({
    name: 'InvalidSyncFileResponseError',
  });
  expect(fs.writeFile).not.toHaveBeenCalled();
});
