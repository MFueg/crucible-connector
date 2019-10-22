export interface UserName {
  name: string;
}

export interface UserPassword {
  password: string;
}

export interface UserCreate {
  name: string;
  password: string;
  displayName: string;
}

export interface UserData {
  name: string;
  displayName: string;
  email: string;
}
