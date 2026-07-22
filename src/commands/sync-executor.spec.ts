import { expect, test, vi } from 'vitest';
import type { FileSystem, RemoteFile } from 'orgnote-api';
import { createExecutor } from './sync.js';
import type { Api } from './sdk.js';

const remoteFile: RemoteFile = {
  path: '/.orgnote/config.toml',
  version: 2,
  deleted: false,
  updatedAt: '2024-01-01T00:00:00Z',
};

test('createExecutor fetchContent reads remote bytes without writing locally', async () => {
  const content = new TextEncoder().encode('remote');
  const downloadFile = vi.fn(async () => ({ data: content.buffer }));
  const api = { sync: { downloadFile } } as unknown as Api;
  const fs = { writeFile: vi.fn(async () => undefined) } as unknown as FileSystem;
  const executor = createExecutor(api, '/vault', fs);

  const result = await executor.fetchContent(remoteFile);

  expect(result).toEqual(content);
  expect(downloadFile).toHaveBeenCalledWith(remoteFile.path);
  expect(fs.writeFile).not.toHaveBeenCalled();
});
