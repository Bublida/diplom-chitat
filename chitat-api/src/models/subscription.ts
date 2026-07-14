import mongoose from "mongoose";

const listSubSchema = new mongoose.Schema({
   maxLists: {
      type: Number,
      required: false,
      default: 0
   },
   maxBooksInList: {
      type: Number,
      required: false,
      default: 0
   }
})

const subscriptionSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      about: "Название подписки"
   },
   cost: {
      type: Number,
      required: true,
      about: "Стоимость в месяц"
   },
   symbol: {
      type: String,
      required: false,
      about: "Символ"
   },
   salepercent: {
      type: Number,
      required: false,
      about: "Процент скидки"
   },
   lists: listSubSchema
})

const SubscribtionModel = mongoose.model("Subscription", subscriptionSchema)

const subscriptionBuilders = {
   //! Пока пусто
}

export { SubscribtionModel, subscriptionBuilders }