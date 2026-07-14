import mongoose from "mongoose";

// Схема купленной книги
const booksSubSchema = new mongoose.Schema({
   bookid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: false,
   },
   progress: {
      type: Number,
      required: false,
      default: 0
   }
   //todo Расширить саб-схему для лучшего функционала 
})

// Схема коллекционного блока
const collectionsSubSchema = new mongoose.Schema({
   liked: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Book',
      default: []
   },
   lists: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Collection',
      default: []
   },
}, { _id: false })

// Схема учебного блока
const teachSubSchema = new mongoose.Schema({
   teachers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      required: false
   },
   classes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Class',
      required: false
   }
}, { _id: false })

// Схема подписки
const subscribeSchema = new mongoose.Schema({
   type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      default: () => new mongoose.Types.ObjectId('69bb5fe8eddf54bccfde9576')
   },
   expiresAt: {
      type: Date
   },
   teach: teachSubSchema,
}, { _id: false })

// Схема пользователя
const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      about: "Имя пользователя"
   },
   surname: {
      type: String,
      required: true,
      about: "Фамилия пользователя"
   },
   email: {
      type: String,
      required: true,
      about: "Почта пользователя"
   },
   hash: {
      type: String,
      required: true,
      about: "Хэш пароля"
   },
   subscribe: {
      type: subscribeSchema,
      default: () => ({})
   },
   photo: {
      type: String,
      file: 'Image',
      required: false,
      about: "Фотография пользователя"
   },
   role: {
      type: String,
      enum: ["user", "teacher"],
      required: true,
      default: "user",
      about: "Роль для учебной системы"
   },
   books: [booksSubSchema],
   collections: {
      type: collectionsSubSchema,
      default: () => ({})
   }
})

const UserModel = mongoose.model("User", userSchema)

const userBuilders = {
   //! Пока пусто
}

export { UserModel, userBuilders }