import * as vscode from "vscode";
import { getElementPath } from "@/commons/helpers/workspace";

export function getFileInfo(file: vscode.Uri) {
  const filePath = getElementPath(file.path);
  const cutPath = filePath.split("/");
  const fileName = cutPath.pop();
  if (!fileName) {
    return {
      fileName: "",
      folderPath: "",
      officialName: ""
    };
  }
  let officialName = fileName;
  if (fileName.endsWith(".leek")) {
    officialName = fileName.replace(new RegExp(".leek$"), "");
  }
  const folderPath = cutPath.join("/");

  return {
    officialName,
    folderPath,
    fileName
  };
}
