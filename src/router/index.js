import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import AnswerQuiz from '../views/AnswerQuiz.vue'
import PrivacyPolicy from '../views/PrivacyPolicy.vue'
import Terms from '../views/Terms.vue'
import DoQuiz from '../views/DoQuiz.vue'
import Friends from '../views/Friends.vue'
import Profile from '../views/Profile.vue'
import CreateQuiz from '../views/CreateQuiz.vue'
import Admin from '../views/Admin.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/answer/:userId/:quizId',
    name: 'AnswerQuiz',
    component: AnswerQuiz
  },
  {
    path: '/do-quiz/:quizId',
    name: 'DoQuiz',
    component: DoQuiz
  },
  {
    path: '/friends',
    name: 'Friends',
    component: Friends
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/terms_and_conditions',
    name: 'Terms',
    component: Terms
  },
  {
    path: '/privacy_policy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy
  },
  {
    path: '/create-quiz',
    name: 'CreateQuiz',
    component: CreateQuiz
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  },
  {
    path: '*',
    component: Home
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
