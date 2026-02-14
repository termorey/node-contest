import { createBrowserRouter, RouteObject } from "react-router-dom";
import { App } from "../App.tsx";
import { IndexPage } from "pages/index.tsx";
import { ContestsPage } from "pages/contests.tsx";
import { ContestPage } from "pages/contest.tsx";
import { CreationPage } from "pages/creation.tsx";

const routes: RouteObject[] = [
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        path: "",
        Component: IndexPage,
      },
      {
        path: "contests",
        Component: ContestsPage,
      },
      {
        path: "contests/new",
        Component: CreationPage,
      },
      {
        path: "contests/:contestId",
        Component: ContestPage,
      },
      {
        path: "*",
        Component: IndexPage,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
