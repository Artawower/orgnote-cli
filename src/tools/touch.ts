import { utimesSync } from 'fs';

export function touch(fileName: string, time: Date) {
  utimesSync(fileName, time, time);
}
