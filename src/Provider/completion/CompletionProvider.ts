import {
  CancellationToken,
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  MarkdownString,
  Position,
  ProviderResult,
  TextDocument
} from "vscode";
import { constantDetailsState } from "@/GameDefinitions/commands/syncLeekwarsVersion";

export default class IntellisenseProvider implements CompletionItemProvider {
  public static readonly defaultAutoStripExtensions: string[] = [
    ".leek",
    ".lk"
  ];

  public static readonly languageSelector: string[] = [
    "leekscript",
    "leekscript v1",
    "leekscript v1.1",
    "plaintext"
  ];

  private parseLine(document: TextDocument, position: Position): string {
    const wordRange = document.getWordRangeAtPosition(position);
    return document.getText(wordRange);
  }

  /**
   * Provide completion items for the given position and document.
   *
   * @param document The document in which the command was invoked.
   * @param position The position at which the command was invoked.
   * @param token A cancellation token.
   * @return An array of completions, a [completion list](#CompletionList), or a thenable that resolves to either.
   * The lack of a result can be signaled by returning `undefined`, `null`, or an empty array.
   */
  public provideCompletionItems(
    document: TextDocument,
    position: Position,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _token: CancellationToken
  ) {
    const word = this.parseLine(document, position);

    const list: CompletionItem[] = [];

    for (const key of Object.keys(constantDetailsState.constants)) {
      if (key.includes(word)) {
        const completionItem = new CompletionItem(
          key,
          CompletionItemKind.Constant
        );
        completionItem.detail = "Constant";
        completionItem.documentation = new MarkdownString(
          constantDetailsState.constants[key].description
        );
        list.push(completionItem);
      }
    }

    for (const key of Object.keys(constantDetailsState.functions)) {
      if (key.includes(word)) {
        for (const func of constantDetailsState.functions[key]) {
          const completionItem = new CompletionItem(
            key,
            CompletionItemKind.Function
          );
          completionItem.detail = "Function";
          const md = new MarkdownString();
          md.isTrusted = true;
          md.appendCodeblock(
            `${key}(${func.arguments
              .map(
                e =>
                  // eslint-disable-next-line prettier/prettier
                  `${e.name}: ${constantDetailsState.lang[`arg_type_${e.type}`]
                  }`
              )
              .join(", ")})`,
            "typescript"
          );
          md.appendMarkdown(
            `${func.arguments
              .map(e => `${e.name}: ${e.description}  \n`)
              .join("")}`
          );
          md.appendText("  \n" + func.description + "  \n  \n");
          completionItem.documentation = md;
          list.push(completionItem);
        }
      }
    }
    return list;
  }

  public resolveCompletionItem(
    item: CompletionItem,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _token: CancellationToken
  ): ProviderResult<CompletionItem> {
    return item;
  }
}
