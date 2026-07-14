import mongoose from "mongoose";

const authorSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      about: "Полное Имя автора"
   },
   description: {
      type: String,
      required: true,
      about: "Описание автора"
   },
   photo: {
      type: String,
      required: true,
      file: 'Image',
      about: "Фото автора"
   },
   shortname: {
      type: String,
      required: false,
      about: "Укороченное имя автора (инициалы + фамилия)"
   }
})
   .pre('save', function () {
      if (this.name && !this.shortname) {
         const [name, surname, patronymic] = this.name.split(' ');
         if (patronymic) {
            this.shortname = `${name[0]}.${surname[0]}. ${patronymic}`;
         } else {
            this.shortname = `${name[0]}. ${surname}`;
         }
      }
   })

const AuthorModel = mongoose.model("Author", authorSchema)

const authorBuilders = {
   'author-search': (args: any, filter: any) => {
        const DEFAULT_LIMIT = 3
        const { prompt, limit } = args
        filter.$pipe = [
            { $match: { name: { $regex: prompt, $options: "i" } } },
            { $limit: limit ?? DEFAULT_LIMIT }
        ];
    }
}

export { AuthorModel, authorBuilders }