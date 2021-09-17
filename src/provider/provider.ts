import {
  CancellationToken,
  CompletionItem,
  CompletionItemProvider,
  Position,
  TextDocument
} from "vscode";
// import { Functions } from "../types/Functions";
// import { Constant } from "../types/Constants";
// import { got } from "../helpers/got";
// import { Api } from "../LeekApi";

export default class IntellisenseProvider implements CompletionItemProvider {
  // public static readonly builtinModules: string[] = getBuiltinModules();

  // public static readonly configPath: string = "node-module-intellisense";
  public static readonly defaultAutoStripExtensions: string[] = [
    ".leek",
    ".lk"
  ];

  public static readonly languageSelector: string[] = [
    "leekscript",
    "leekscript v1",
    "leekscript v1.1"
  ];

  public static readonly triggerCharacters: string[] = ["'", '"', "/"];

  /**
   * Provide completion items for the given position and document.
   *
   * @param document The document in which the command was invoked.
   * @param position The position at which the command was invoked.
   * @param token A cancellation token.
   * @return An array of completions, a [completion list](#CompletionList), or a thenable that resolves to either.
   * The lack of a result can be signaled by returning `undefined`, `null`, or an empty array.
   */
  public async provideCompletionItems(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<CompletionItem[]> {
    return [];
  }
}

// async function getBuiltinModules(): Promise<string[]> {
//   const functions = (await Api.functionGetAll()).functions;
//   const constants = (await Api.constantGetAll()).constants;
//   return [...functions, ...constants];
// }
