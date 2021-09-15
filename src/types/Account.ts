import { Farmer } from "./Farmer";

export type Account = {
    farmer: Farmer,
    token: string,
    farmers: number
};

export type BasicAccountInfo = {
    id: number,
    name: string,
};
