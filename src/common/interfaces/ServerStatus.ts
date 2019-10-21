import { Version } from '../../crucible/interfaces/Version';

export interface ServerStatus {
  timeZone: string;
  appHomeDir: string;
  appInstanceDir: string;
  version: Version;
  isFishEye: boolean;
  isCrucible: boolean;
}
