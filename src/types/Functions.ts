export type Functions = {
    functions: Function[]
};

export type Function = {
    id: number,
    name: string,
    level: number,
    category: number,
    operations: number,
    argumentsNames: ArgumentName[],
    argumentsTypes: ArgumentType[],
    returnType: number,
    returnName: string,
    deprecated: number,
    replacement: number | null
};

export type ArgumentName = {
    name: string
};

export type ArgumentType = {
    name: string
};
