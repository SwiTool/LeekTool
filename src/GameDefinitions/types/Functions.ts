export type TypedElement = {
  name: string;
  type: string;
  description: string;
};

export interface Functions {
  id: number;

  name: string;

  level: number;

  category: number;

  operations: number;

  arguments: TypedElement[];

  return: TypedElement;

  deprecated: number;

  description: string;

  replacement: number | null;
}
