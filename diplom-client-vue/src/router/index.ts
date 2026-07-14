import { checkAuthorization, updateUserData } from '@api/authorization'
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@pages/Login.page.vue'
import RegisterPage from '@pages/Register.page.vue'
import AuthorPage from '@pages/Author.page.vue'
import BookPage from '@/pages/Book.page.vue'
import IndexPage from '@pages/Index.page.vue'
import ProfilePage from '@pages/Profile.page.vue'
import BookmarksPage from '@pages/Bookmarks.page.vue'
import MyBooksPage from '@pages/MyBooks.page.vue'
import CollectionPage from '@pages/Collection.page.vue'
import PaymentPage from '@pages/Payment.page.vue'
import CreateCollectionPage from '@pages/CreateCollection.page.vue'
import LibraryPage from '@pages/Library.page.vue'
import ReadPage from '@pages/Read.page.vue'
import { useLayoutStore } from '@/stores/layout'
import CatalogPage from '@/pages/Catalog.page.vue'
import ClassPage from '@/pages/Class.page.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: IndexPage,
    },
    {
      path: '/book/:id',
      name: 'book',
      component: BookPage
    },
    {
      path: '/author/:id',
      name: 'author',
      component: AuthorPage
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfilePage,
      beforeEnter: async (to, from) => {
        if (checkAuthorization()) {
          return true;
        } else {
          return { name: 'login' }
        }
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      beforeEnter: () => {
        useLayoutStore().error = ""
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
      beforeEnter: () => {
        useLayoutStore().error = ""
      }
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: BookmarksPage
    },
    {
      path: '/my-books',
      name: 'mybooks',
      component: MyBooksPage,
      beforeEnter: async (to, from) => {
        if (checkAuthorization()) {
          return true;
        } else {
          return { name: 'login' }
        }
      }
    },
    {
      path: '/collection/:id',
      name: 'collection',
      component: CollectionPage
    },
    {
      path: '/payment/:id',
      name: 'pay',
      component: PaymentPage
    },
    {
      path: '/collection',
      name: 'new-collection',
      component: CreateCollectionPage
    },
    {
      path: '/library/:id',
      name: 'library',
      component: LibraryPage
    },
    {
      path: '/read/:id',
      name: 'read',
      component: ReadPage
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: CatalogPage
    },
    {
      path: '/class/:id',
      name: 'class',
      component: ClassPage,
      beforeEnter: async (to, from) => {
        if (checkAuthorization()) {
          return true;
        } else {
          return { name: 'login' }
        }
      }
    }
  ],
  // Desktop scroll navigation
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  },
});
router.beforeEach(async () => {
  // Mobile scroll navigation
  const layoutEl = document.querySelector('.mobile-screen');
  if (layoutEl) {
    layoutEl.scrollTop = 0;
  }
  // UserData update
  if (checkAuthorization()) {
    await updateUserData();
    console.log('userData update')
  }
  return true;
})

export default router
