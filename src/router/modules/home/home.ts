import type { RouteRecordRaw } from 'vue-router';
import AppLayout from '@/pages/layouts/AppLayout.vue';
import { COMMENT_PAGE, DESCRIPTION_PAGE, SUBMISSION_PAGE } from '@/stores/constants/constant';
const homeRoute: RouteRecordRaw = {
  path: '/',
  name: 'home',
  component: AppLayout,
  children: [
    {
      path: '/home',
      name: 'home1',
      component: () => import("@/pages/home/HomePage.vue")
    },
    {
      path: '/compiler',
      name: 'compiler',
      component: () => import("@/pages/home/Compiler.vue")
    },
    {
      path: '/arduino-compiler',
      name: 'arduino-compiler',
      component: () => import("@/pages/home/ArduinoCompiler.vue")
    },
    {
      path: '/exercises',
      name: 'exercises',
      component: () => import("@/pages/home/Exercise.vue"),
      children: [
        {
          path: '/exercises/desc',
          name: DESCRIPTION_PAGE,
          component: () => import("@/pages/home/components/DescriptionPage.vue"),
        },
        {
          path: '/exercises/submission',
          name: SUBMISSION_PAGE,
          component: () => import("@/pages/home/components/SubmissionPage.vue"),
        },
        {
          path: '/exercises/comment',
          name: COMMENT_PAGE,
          component: () => import("@/pages/home/components/CommentPage.vue"),
        }
      ]
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import("@/pages/home/Terms.vue")
    }
  ]
};

export default homeRoute;
