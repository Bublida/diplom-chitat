import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      about: "Пользователь, оставивший комментарий"
   },
   score: {
      type: String,
      enum: ['like', 'dislike', 'flat'],
      default: 'flat',
      required: true,
      about: "Понравилось ли пользователю произведение"
   },
   comment: {
      type: String,
      required: true,
      about: "Текст комментария"
   },
   read: {
      type: Boolean,
      required: true,
      about: "Прочитана ли книга полностью"
   },
   datestamp: {
      type: Date,
      required: true,
      default: Date.now(),
      about: "Временная метка написания комментария"
   },
   spoilers: {
      type: Boolean,
      required: true,
      default: false,
      about: "Присутствуют ли спойлеры в комментарии"
   }
})

const CommentModel = mongoose.model("Comment", commentSchema)

const commentBuilders = {
   //! Пока пусто
}

export { CommentModel, commentBuilders }