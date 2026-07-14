import SchemaVault from "./../core/SchemaVault";
import { bookBuilders, BookModel } from "@models/book";
import { classBuilders, ClassModel } from "@models/class";
import { collectionBuilders, CollectionModel } from "@models/collection";
import { commentBuilders, CommentModel } from "@models/comment";
import { SubscribtionModel, subscriptionBuilders } from "@models/subscription";
import { userBuilders, UserModel } from "@models/user";
import { AuthorModel, authorBuilders } from "@models/author";


const schemas = SchemaVault

   .register("book", {
      info: { icon: "📖", title: "Книги" },
      model: BookModel,
      _builds: bookBuilders
   })
   .register("user", {
      info: { icon: "🙂", title: "Пользователи" },
      model: UserModel,
      _builds: userBuilders
   })
   .register("collection", {
      info: { icon: "📚", title: "Коллекции" },
      model: CollectionModel,
      _builds: collectionBuilders
   })
   .register("class", {
      info: { icon: "🤓", title: "Классы/Группы" },
      model: ClassModel,
      _builds: classBuilders
   })
   .register("subscription", {
      info: { icon: "🎫", title: "Подписки" },
      model: SubscribtionModel,
      _builds: subscriptionBuilders
   })
   .register("comment", {
      info: { icon: "💬", title: "Комментарии" },
      model: CommentModel,
      _builds: commentBuilders
   })
   .register("author", {
      info: { icon: "🕯", title: "Авторы" },
      model: AuthorModel,
      _builds: authorBuilders
   })

   .get()


export default schemas