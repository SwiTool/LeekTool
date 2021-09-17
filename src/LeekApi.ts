import got, { Got } from "got";
import { IncomingHttpHeaders } from "http";
import { CookieJar } from "tough-cookie";
import { debug } from "./debug";
import { Account } from "./types/Account";
import { FarmerAIs } from "./types/Farmer";
import { AIContent } from "./types/FileTree";

const cookieJar = new CookieJar();

const client = got.extend({
  cookieJar,
  prefixUrl: "https://leekwars.com/api/"
});

export interface Response<T> {
  statusCode: number;
  headers: IncomingHttpHeaders;
  body: T;
}

export type Lang = "fr" | "en";

export type HttpClient = {
  client: Got;
  lang: Lang;
};

class LeekApi {
  private client: Got;

  // private lang: Lang;

  constructor(httpClient: HttpClient) {
    // this.lang = httpClient.lang;
    this.client = httpClient.client;
  }

  private request = async <
    T extends Record<string, string | number | boolean | null>,
    U extends unknown
  >(
    method: "get" | "post",
    path: string,
    opts?: T,
    reqHeaders?: Record<string, string | string[] | undefined> | undefined
  ): Promise<U> => {
    debug(`requesting ${path}`);
    const { body } = await this.client[method](path, {
      headers: reqHeaders,
      searchParams: method === "get" ? opts : undefined,
      form: method === "post" ? opts : undefined,
      responseType: "json"
    });
    return body as U;
  };

  setToken(token: string) {
    cookieJar.setCookie(`token=${token}`, "https://leekwars.com/");
  }

  farmerLoginToken(login: string, password: string): Promise<Account> {
    return this.request("post", "farmer/login-token", { login, password });
  }

  farmerGetFromToken(): Promise<Account> {
    return this.request("get", "farmer/get-from-token");
  }

  aiGetFarmerAis(): Promise<FarmerAIs> {
    return this.request("get", "ai/get-farmer-ais");
  }

  aiGetFarmerAi(id: number): Promise<{ ai: AIContent }> {
    return this.request("get", `ai/get/${id}`);
  }
}

export const Api = new LeekApi({
  client,
  lang: "fr"
});
