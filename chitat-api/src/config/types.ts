import mongoose, { QueryFilter } from "mongoose";

type BuildFunction = (args: any[], filter: any) => void

type BuildFunctionMap = Record<string, BuildFunction>

interface RequestConfig<M> {
  query: {
    [K in keyof M]?: M[K] | { $gte?: number; $lte?: number; $gt?: number; $lt?: number; $in?: any[]; $regex?: RegExp | string };
  } & {
    [key: string]: any;
  };
  screen?: string;
}

type FinalQuery<M> = QueryFilter<M>

interface IInfo {
  icon?: string,
  title?: string
}

interface SchemaRegisterData<T = any> {
  info: IInfo,
  model: mongoose.Model<T>,
  _builds?: BuildFunctionMap
}

interface ISchemaConfig<T = any> {
  fields: FlatSchemaMap,
  info?: IInfo,
  model: mongoose.Model<T>,
  _builds?: BuildFunctionMap,
  _select_ignore?: string[]
}

type SchemasMap = Record<string, ISchemaConfig>

interface FieldInfo {
  type: string,
  required: boolean,
  isArray: boolean,
  enum?: any[],
  ref?: string
}

type FlatSchemaMap = Record<string, FieldInfo>;

interface IParseRequestOptions {
  ignoreBuilders: boolean
  useAggregate: boolean
  populate?: string[]
}

export {
  BuildFunctionMap,
  RequestConfig,
  ISchemaConfig,
  FinalQuery,
  SchemasMap,
  FlatSchemaMap,
  SchemaRegisterData,
  IParseRequestOptions
}

