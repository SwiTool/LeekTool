export type Constants = {
    constants: Constant[]
};

export type Constant = {
    id: number,
    name: string,
    value: string,
    type: number,
    category: number,
    deprecated: number,
    replacement: number | null
};