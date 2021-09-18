export interface BasicAIInfos {
  id: number;
  name: string;
  valid: boolean;
  total_lines: number;
}

export interface AI extends BasicAIInfos {
  entrypoints: string[];
  folder: number;
  total_chars: number;
}

export interface Folder {
  folder: number;
  id: number;
  name: string;
}

export interface AIContent extends BasicAIInfos {
  code: string;
  level: number;
  owner: number;
}
