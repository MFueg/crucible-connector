import { Version } from '../Version';

export interface ServerStatus {
  timeZone: string;
  appHomeDir: string;
  appInstanceDir: string;
  version: Version;
  isFishEye: boolean;
  isCrucible: boolean;
}
