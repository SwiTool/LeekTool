import { Farmer } from "./Farmer";

export interface Account {
  farmer: Farmer;
  token: string;
  farmers: number;
}

export interface BasicAccountInfo {
  id: number;
  name: string;
}
