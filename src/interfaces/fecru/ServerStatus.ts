import { Version } from '../crucible/Version';

export interface ServerStatus {
  timeZone: string;
  appHomeDir: string;
  appInstanceDir: string;
  version: Version;
  isFishEye: boolean;
  isCrucible: boolean;
}
