import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
    CancellationToken,
    Command,
    CompletionItem,
    CompletionItemKind,
    CompletionItemProvider,
    Disposable,
    ExtensionContext,
    FileSystemWatcher,
    Position,
    TextDocument,
    TextEdit,
    Uri,
    WorkspaceConfiguration,
} from "vscode";
import { Functions } from '../types/Functions';
import { Constants } from '../types/Constants';
import { got } from '../helpers/got';



export default class IntellisenseProvider implements CompletionItemProvider {
    // public static readonly builtinModules: string[] = getBuiltinModules();

    // public static readonly configPath: string = "node-module-intellisense";
    public static readonly defaultAutoStripExtensions: string[] = [".leek", ".lk"];
    public static readonly languageSelector: string[] = ["leekscript", "leekscript v1", "leekscript v1.1"];
    public static readonly triggerCharacters: string[] = ["'", "\"", "/"];

    /**
     * Provide completion items for the given position and document.
     *
     * @param document The document in which the command was invoked.
     * @param position The position at which the command was invoked.
     * @param token A cancellation token.
     * @return An array of completions, a [completion list](#CompletionList), or a thenable that resolves to either.
     * The lack of a result can be signaled by returning `undefined`, `null`, or an empty array.
     */
    public async provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): Promise<CompletionItem[]> {
        return [];
    }
}

async function getFunctions(): Promise<string[]> {
    const data = await got.get(`functions/get-all`).json<Functions>();
    return Array.from(new Set(data.functions.map(f => f.name)));
}

async function getConstants(): Promise<string[]> {
    const data = await got.get(`constants/get-all`).json<Constants>();
    return Array.from(new Set(data.constants.map(c => c.name)));
}

async function getBuiltinModules(): Promise<string[]> {
    const functions = await getFunctions();
    const constants = await getConstants();
    return [...functions, ...constants];
}