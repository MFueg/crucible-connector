import { Version } from '../../crucible/interfaces/version';

export interface ServerStatus {
  timeZone: string;
  appHomeDir: string;
  appInstanceDir: string;
  version: Version;
  isFishEye: boolean;
  isCrucible: boolean;
}
