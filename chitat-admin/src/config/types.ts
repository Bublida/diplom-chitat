interface Schema {
    name: string,
    info: {
        title: string,
        icon: string
    },
    fields: Record<string, FieldInfo>
}

type FieldType = "String" | "File" | "Number" | "ObjectId" | "Boolean" | "Embedded" | "Date"
type FileType = "File" | "Image"

interface FieldInfo {
    type: FieldType,
    isArray: boolean,
    required: boolean,
    about?: string,
    ref?: string
    filetype?: FileType,
    enum?: Array<string>,
    $emb?: boolean
}
type FieldsSet = Array<[string, FieldInfo]>

export type { Schema, FieldsSet, FieldInfo }