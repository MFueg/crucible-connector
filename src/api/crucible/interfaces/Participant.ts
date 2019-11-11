export type Participant = ParticipantUserWrapper | ParticipantGroupWrapper;

export interface ParticipantUserWrapper {
  type: "USER";
  user: ParticipantUser;
}

export interface ParticipantGroupWrapper {
  type: "GROUP";
  group: ParticipantGroup;
}

export interface ParticipantGroup {
  name: string;
}

export interface ParticipantUser {
  name: string;
  displayName: string;
  avatarImageUrl: string;
  id: number;
}
