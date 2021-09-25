import got, { Got } from "got";
import { IncomingHttpHeaders } from "http";
import { CookieJar } from "tough-cookie";
import { debug } from "@/commons/helpers/debug";
import { login } from "./helpers/login";
import { Account } from "@/GameDefinitions/types/Account";
import { Chip } from "@/GameDefinitions/types/Chip";
import { Constants } from "@/GameDefinitions/types/Constants";
import { FarmerAIs } from "@/GameDefinitions/types/Farmer";
import { AIContent } from "@/types/FileTree";
import { Functions } from "@/GameDefinitions/types/Functions";
import { Weapon } from "@/GameDefinitions/types/Weapon";
import * as vscode from "vscode";
import { sleep } from "@/commons/helpers/sleep";

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

export class LeekAPI {
  private client: Got;

  static context: vscode.ExtensionContext;

  constructor(httpClient: HttpClient) {
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
    for (let tries = 1; tries < 4; ++tries) {
      try {
        const { body } = await this.client[method](path, {
          headers: reqHeaders,
          searchParams: method === "get" ? opts : undefined,
          form: method === "get" ? undefined : opts,
          responseType: "json"
        });

        return body as U;
      } catch (e: any) {
        if (e.response?.body?.error === "wrong_token") {
          await sleep(2000 * Math.pow(tries, tries));
          await login(LeekAPI.context);
        } else {
          throw e;
        }
        console.error(e.response);
      }
    }
    throw new Error("cannot make request...");
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

  constantGetAll(): Promise<{ constants: Constants[] }> {
    return this.request("get", "constant/get-all");
  }

  chipGetAll(): Promise<{ chips: Chip[] }> {
    return this.request("get", "chip/get-all");
  }

  weaponGetAll(): Promise<{ weapons: Weapon[] }> {
    return this.request("get", "weapon/get-all");
  }

  langGet(
    type: string,
    lang = "fr"
  ): Promise<{ lang: Record<string, string> }> {
    return this.request("get", `lang/get/${type}/${lang}`);
  }

  leekWarsVersion(): Promise<{ version: number }> {
    return this.request("get", "leek-wars/version");
  }
}

export const Api = new LeekAPI({
  client,
  lang: "fr"
});
