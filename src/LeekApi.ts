import got, { Got } from "got";
import { IncomingHttpHeaders } from "http";
import { CookieJar } from "tough-cookie";
import { debug } from "./debug";
import { Account } from "./types/Account";
import { Constant } from "./types/Constants";
import { FarmerAIs } from "./types/Farmer";
import { AIContent } from "./types/FileTree";
import { Functions } from "./types/Functions";

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
    method: "get" | "post" | "put" | "delete",
    path: string,
    opts?: T,
    reqHeaders?: Record<string, string | string[] | undefined> | undefined
  ): Promise<U> => {
    debug(`requesting ${path}`);
    try {
      const { body } = await this.client[method](path, {
        headers: reqHeaders,
        searchParams: method === "get" ? opts : undefined,
        form: method === "get" ? undefined : opts,
        responseType: "json"
      });

      return body as U;
    } catch (e: any) {
      console.error(e.response);
      throw e;
    }
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

  aiChangeFolder(id: number, folderId: number) {
    return this.request("post", "ai/change-folder", {
      ai_id: id,
      folder: folderId
    });
  }

  aiSave(id: number, code: string) {
    return this.request("post", "ai/save", { ai_id: id, code });
  }

  aiNewName(
    folder_id: number,
    version: number,
    name: string
  ): Promise<{ ai: AIContent }> {
    return this.request("post", "ai/new-name", { folder_id, version, name });
  }

  aiDelete(id: number) {
    return this.request("delete", "ai/delete", { ai_id: id });
  }

  functionGetAll(): Promise<{ functions: Functions[] }> {
    return this.request("get", "function/get-all");
  }

  constantGetAll(): Promise<{ constants: Constant[] }> {
    return this.request("get", "constant/get-all");
  }
}

export const Api = new LeekApi({
  client,
  lang: "fr"
});
