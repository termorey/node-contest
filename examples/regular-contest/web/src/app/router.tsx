import { createBrowserRouter } from "react-router";
import { App } from "./app.tsx";
import { IndexPage } from "@/pages/index.tsx";
import { ContestsPage } from "@/pages/contests.tsx";
import { ContestPage } from "@/pages/contest.tsx";
import { CreationPage } from "@/pages/creation.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        Component: IndexPage,
      },
      {
        path: "contests",
        children: [
          {
            index: true,
            Component: ContestsPage,
          },
          {
            path: "new",
            Component: CreationPage,
          },
          {
            path: ":contestId",
            Component: ContestPage,
          },
        ],
      },
      {
        path: "*",
        Component: IndexPage,
      },
    ],
  },
]);
