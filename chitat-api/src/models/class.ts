import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
   title: {
      type: String,
      required: true,
      about: "Заголовок / Название класса, по типу `11А` или `6В` или произвольное"
   },
   subtitle: {
      type: String,
      required: false,
      about: "Подзаголовок"
   },
   students: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: false,
      about: "Студенты/учащиеся в классе/группе"
   },
   teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      about: "Преподаватели в классе/группе"
   },
   icon: {
      type: String,
      required: false,
      about: "Иконка"
   },
   books: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Book",
      required: true,
      default: [],
      about: "Книги учебной группы"
   },
   inviteLink: {
      type: String,
      required: false,
      about: "Пригласительная ссылка"
   }
})
   .pre("save", function () {
      // Генерация уникального пригласительного кода
      if (!this.inviteLink) {
         this.inviteLink = crypto.randomUUID().split("-")[0];
      }
   })

const ClassModel = mongoose.model("Class", classSchema)

const classBuilders = {
   //! Пока пусто
}

export { ClassModel, classBuilders }