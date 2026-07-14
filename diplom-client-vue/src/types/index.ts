export type SearchView = 'half' | 'full' | 'hidden'

export interface HatInfo {
   title: string,
   subtitle?: string,
   icon?: string
}

export type MethodType = 'query' | 'mutation' | 'delete' | 'api';

export interface UseApiOptions {
   base: `${MethodType}/${string}`,
   query?: Record<string, unknown>,
   screen?: string,
   first?: boolean,
   token?: boolean
   fetchOptions?: {
      body?: unknown
   }
}

export interface QueryRequestBody {
   query: Record<string, unknown> | string,
   screen?: string
}

export interface LoginData {
   email: string,
   password: string
}

export interface RegisterData {
   email: string,
   password: string,
   confirm: string,
   name: string,
   surname: string,
}

export type BookCardType = 'tile' | 'mobile' | 'desktop' | 'bar' | 'auto'

export interface FontScaleOptions {
   min: number,
   max: number,
   step: number,
   initial: number
}

export interface TableContents {
   number?: number,
   title: string,
   pagelink: number
}

export interface Bookmark {
   id: string
   tip: string
   comment: string
   pagelink: number
}