import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
   title: {
      type: String,
      required: true,
      about: "Наименование коллекции"
   },
   type: {
      type: String,
      enum: ['List', 'Series'],
      required: true,
      about: "Тип коллекции"
   },
   cover: {
      type: String,
      file: 'Image',
      required: false,
      about: "Обложка коллекции"
   },
   icon: {
      type: String,
      required: false,
      about: "Иконка для коллекций типа `List`"
   },
   color: {
      type: String,
      required: false,
      about: "hex-цвет для коллекции типа `List`"
   },
   books: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Book',
      required: true,
      about: "Книги в коллекции"
   }
})

const CollectionModel = mongoose.model("Collection", collectionSchema)

const collectionBuilders = {
   //! Пока пусто
}

export { CollectionModel, collectionBuilders }