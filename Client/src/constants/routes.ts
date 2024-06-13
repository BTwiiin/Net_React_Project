import AvailableTicketsPage from "../pages/home/availabletickets";

import {
  LoginPage,
  MainPage,
  RegisterPage,
  ProfilePage,
  TicketPage,
} from "../pages/";

export const availableRoutes = [
  {
    path: "/",
    component: MainPage,
    requiresAuth: true,
  },
  {
    path: "/login",
    component: LoginPage,
    requiresAuth: false,
  },
  {
    path: "/register",
    component: RegisterPage,
    requiresAuth: false,
  },
  {
    path: "/schedule",
    component: ProfilePage,
    requiresAuth: true,
  },
    {
        path: "/ticket/:id",
        component: TicketPage,
        requiresAuth: true,
    },
    {
      path: "/available-tickets",
      component: AvailableTicketsPage,
      requiresAuth: true,
    },
];
