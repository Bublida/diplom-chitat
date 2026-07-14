export interface Book {
   _id: string,
   adapts?: string[],
   additional: {
      lang: string,
      publisher?: string,
      year?: string
   },
   author?: Author,
   basecost: number,
   bookmarks: number,
   buys: number,
   comments: Comment[],
   cover?: string,
   description: string,
   library: Library,
   tags: string[],
   title: string
   rating?: string
}

export interface Author {
   _id: string,
   description: string,
   name: string,
   photo?: string,
   shortname?: string
}

export interface Comment {
   _id: string,
   comment: string,
   datestamp: string,
   read: boolean,
   score: "flat" | "like" | "dislike",
   spoilers: boolean,
   user: string
}

export interface Library {
   _id: string,
   cost: number,
   lists: {
      maxLists: number,
      maxBooksInList: number
   }
   name: 'Учебная' | 'Премиум' | 'Стандарт' | 'Открытая' | string,
   salepercent: number,
   symbol?: string
}

export interface Collection {
   _id: string,
   books: Book[] | Book['_id'][],
   cover?: string,
   color?: string,
   icon?: string,
   title: string,
   type: "Series" | "List" | string
}

export interface Class {
   _id: string,
   title: string,
   subtitle?: string,
   students?: any[],
   teacher: any,
   icon?: string,
   collections: {
      collection: Collection['_id'],
      allowed: string[]
   }[],
   inviteLink: string
}