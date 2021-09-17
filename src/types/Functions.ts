export interface Functions {
  id: number;

  name: string;

  level: number;

  category: number;

  operations: number;

  arguments_names: string[];

  arguments_types: string[];

  return_name: string | null;

  return_type: number;

  deprecated: number;

  replacement: number | null;
}
