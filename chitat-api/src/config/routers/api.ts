import { UserModel } from "@models/user";
import e from "express"
import argon2 from "argon2";
import jwt from "jsonwebtoken"
import { logger } from "core/Logger";
import { BookModel } from "@models/book";
import { fb2ToMarkdown } from "@utils/fb2md";
import path from "path";
import fs from "fs/promises";
import { extractFb2FromZip, isZipBuffer } from "@utils/zipParser";
import QueryAPI from "core/Query";
import { ClassModel } from "@models/class";
import mongoose from "mongoose";


function authMiddleware(req: any, res: any, next: any) {
   const authHeader: string = req.headers.authorization

   if (!authHeader || !authHeader.startsWith('Bearer ')) {

      console.error('No token provided')

      return res.send({ message: 'Access denied. No token provided' })
   }

   const secret = process.env.SECRET_KEY
   if (secret === undefined) throw Error('Secret is missing');
   const token = authHeader.split(' ')[1];

   jwt.verify(token, secret, (err, decoded) => {
      if (err) {
         if (err.name === 'TokenExpiredError') {
            return res.json({ message: 'Token has expired.' });
         }
         console.error('Invalid token')
         return res.json({ message: 'Invalid token.' });
      }

      req.user = decoded ? (decoded as jwt.JwtPayload).user : undefined;
      next();
   })
}

function createJWT(id: any) {
   const secret = process.env.SECRET_KEY
   if (secret === undefined) throw Error('Secret is missing');

   const token = jwt.sign({ user: id }, secret, {
      expiresIn: "60d" // Истекает через 60 дней = 2 месяца
   })

   return token
}

const router = e.Router();

router.get('/test', async (req, res) => {
   res.send('Test complete!')
})

/*
   email
   password
 */
router.post('/login', async (req, res) => {
   const { email, password } = req.body
   try {
      const user = await UserModel.findOne({ email }, "_id hash")
      // Проверка на существование пользователя
      if (user && await argon2.verify(user.hash as string, password)) {
         // Пользователь существует
         const token = createJWT(user._id)

         res.status(200)
            .send({ token })

      } else {
         throw Error('Invalid login or password')
      }
   } catch (error: any) {
      res.send({ message: error.message })
      logger.error(`Ошибка авторизации:`, error)
   }
})

/*
   name
   surname
   password
   email
 */
router.post('/register', async (req, res) => {
   const regData: any = req.body
   try {
      const exist = await UserModel.exists({ email: regData.email })
      if (exist) {
         throw Error("User with this email already exists")
      }

      const hash = await argon2.hash(regData.password)

      const user = await UserModel.insertOne({
         name: regData.name,
         surname: regData.surname,
         hash,
         email: regData.email
      })

      if (user) {
         const token = createJWT(user._id)

         res.status(200)
            .send({ token })
      } else {
         throw Error("Creating account error")
      }

   } catch (error: any) {
      res.send({ message: error.message })
      logger.error(`Ошибка регистрации:`, error)
   }
})

router.post('/user', authMiddleware, async (req, res) => {
   if ('user' in req && req.user !== undefined) {
      const { user } = req
      const userData = await UserModel.findById(user).populate({
         path: 'subscribe',
         populate: {
            path: 'type'
         }
      })
      res.status(200).send(userData)
   }
})

router.post('/marks', authMiddleware, async (req, res) => {
   if ('user' in req && req.user !== undefined) {
      const { user } = req
      const { mark } = req.body
      const userData = await UserModel.findById(user)
      const liked = userData?.collections?.liked
      if (liked) {
         if (liked.includes(mark)) {
            const index = liked.findIndex((item) => item.equals(mark));
            if (index !== -1) {
               userData.collections?.liked?.splice(index, 1);
            }
         } else {
            userData.collections?.liked?.push(mark)
            await BookModel.updateOne({ _id: mark }, { $inc: { bookmarks: 1 } });
         }
      }
      await userData?.save()
      res.send(userData?.collections?.liked)
   }
})

router.post('/collection', authMiddleware, async (req, res) => {
   if ('user' in req && req.user !== undefined) {
      const { user } = req
      const { collection } = req.body
      const userData = await UserModel.findById(user)
      const lists = userData?.collections?.lists
      if (lists) {
         if (lists.includes(collection)) {
            const index = lists.findIndex((item) => item.equals(collection));
            if (index !== -1) {
               userData.collections?.lists?.splice(index, 1);
            }
         } else {
            userData.collections?.lists?.push(collection)
         }
      }
      await userData?.save()
      res.send(userData?.collections?.lists)
   }
})

router.post('/class/exit', authMiddleware, async (req, res) => {
   if ('user' in req && req.user !== undefined) {
      const { user } = req
      const { classid } = req.body

      await ClassModel.updateOne({ _id: classid }, { $pull: { students: user } });
   }
   res.send('Пока!')
})

router.post('/class/invite/:code', authMiddleware, async (req, res) => {
   if ('user' in req && req.user !== undefined) {
      const { user } = req

      const result = await ClassModel.findOneAndUpdate({ inviteLink: req.params.code }, { $push: { students: user } });

      if (!result) {
         res.send({ message: 'Неверный код' });
         return;
      }
   }
   res.send('Добро пожаловать, хорошей учёбы!')
})

router.post('/progress', authMiddleware, async (req, res) => {
   if ('user' in req && req.user !== undefined) {
      const { user } = req
      const { bookid, progress } = req.body;

      const result = await UserModel.findByIdAndUpdate(
         user,
         { $set: { "books.$[elem].progress": progress } },
         {
            arrayFilters: [{ "elem.bookid": bookid }], // Передаем именно ObjectId
            returnDocument: 'after'
         }
      );

      if (!result) {
         res.send({ message: 'Неверный код' });
         return;
      }
   }
   res.send('Добро пожаловать, хорошей учёбы!')
})

router.post('/buy', authMiddleware, async (req, res) => {
   if ('user' in req && req.user !== undefined) {
      const { user } = req
      const { book } = req.body

      await UserModel.updateOne({ _id: user }, { $push: { books: { bookid: book } } })
      await BookModel.updateOne({ _id: book }, { $inc: { buys: 1 } });
   }
   res.send('Оплата прошла успешно!')
})

router.post('/import', async (req, res) => {
   async function getFb2BufferFromApi(html: string, initialUrl: string): Promise<Buffer> {
      console.log('=== STARTING API DOWNLOAD PROCESS ===');

      // 1. Ищем ссылку API в HTML (основной способ)
      const apiLinkMatch = html.match(/href\s*=\s*"([^"]*\/api\/get\.php\?b=\d+&f=fb2)"/i);

      if (apiLinkMatch) {
         const apiLink = apiLinkMatch[1];
         const absoluteUrl = new URL(apiLink, initialUrl).toString();
         console.log('Found API download link:', absoluteUrl);

         const apiRes = await fetch(absoluteUrl, {
            headers: {
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
               'Referer': initialUrl,
               'Accept': 'application/fb2'
            }
         });

         if (!apiRes.ok) {
            throw new Error(`API download failed with status ${apiRes.status}`);
         }

         const arrayBuffer = await apiRes.arrayBuffer();
         return Buffer.from(arrayBuffer);
      }

      // 2. Если не нашли через href, ищем в JavaScript (резервный способ)
      const jsBParamMatch = html.match(/b\s*[:=]\s*(\d+)/);
      if (jsBParamMatch) {
         const bParam = jsBParamMatch[1];
         const apiUrl = `https://avidreaders.ru/api/get.php?b=${bParam}&f=fb2`;
         console.log('Found b parameter in JS, constructing API URL:', apiUrl);

         const apiRes = await fetch(apiUrl, {
            headers: {
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
               'Referer': initialUrl,
               'Accept': 'application/fb2'
            }
         });

         if (!apiRes.ok) {
            throw new Error(`API download failed with status ${apiRes.status}`);
         }

         const arrayBuffer = await apiRes.arrayBuffer();
         return Buffer.from(arrayBuffer);
      }

      throw new Error('Could not find API download link in HTML response');
   }

   function convertToFb2Link(url: string): string {
      // Заменяем /book/ на /download/ (БЕЗ ?f=fb2)
      return `${url.replace('/book/', '/download/')}?f=fb2`;
   }

   try {
      const { url, id, field } = req.body;

      if (!url || typeof url !== 'string' ||
         !id || typeof id !== 'string' ||
         !field || typeof field !== 'string') {
         return res.status(400).json({ error: 'Url, Bookid and Field parameters is required' });
      }

      const formattedUrl = convertToFb2Link(url);
      console.log('=== FIRST REQUEST TO DOWNLOAD PAGE ===', formattedUrl);

      const initialRes = await fetch(formattedUrl, {
         headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html'
         }
      });

      if (!initialRes.ok) {
         throw new Error(`Initial request failed with status ${initialRes.status}`);
      }

      // Получаем HTML страницу с таймером
      const html = await initialRes.text();

      // Ищем и скачиваем через API
      let fb2Buffer = await getFb2BufferFromApi(html, formattedUrl);

      // Проверяем, что получили реальный FB2, а не HTML
      const bufferPreview = fb2Buffer.slice(0, 20).toString('utf-8');
      if (bufferPreview.startsWith('<!DOCTYPE') || bufferPreview.startsWith('<html')) {
         throw new Error('API returned HTML instead of FB2 file. Site protection may have changed.');
      }

      // Обрабатываем ZIP, если нужно
      if (isZipBuffer(fb2Buffer)) {
         console.log('Detected ZIP archive, extracting FB2...');
         fb2Buffer = await extractFb2FromZip(fb2Buffer); // <- ПРОСТО ПЕРЕОПРЕДЕЛЯЕМ ПЕРЕМЕННУЮ
         console.log('FB2 extracted from ZIP, size:', fb2Buffer.length, 'bytes');
      }

      // Конвертируем в Markdown
      const markdown = await fb2ToMarkdown(fb2Buffer);

      if (!markdown || markdown.length < 100) {
         throw new Error('Conversion resulted in empty or too short content');
      }

      const uploadPath = path.join(__dirname, "./../../../files", field);
      const fileName = `${field}_${Date.now()}.md`;
      const fullPath = path.join(uploadPath, fileName);

      await fs.mkdir(uploadPath, { recursive: true });
      await fs.writeFile(fullPath, markdown, 'utf-8');

      const mutationReq: Record<string, any> = {
         params: { model: 'book' },
         body: {
            query: JSON.stringify({
               _id: id,
               [field]: `${field}/${fileName}`
            })
         }
      };

      await QueryAPI.mutation(mutationReq);
      res.send('success');
   } catch (err) {
      console.error('Import error:', err);
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
   }
});

export default router;

export { router as ApiRouter }