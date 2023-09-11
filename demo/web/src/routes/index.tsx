import { createBrowserRouter, RouteObject } from "react-router-dom";
import { App } from "../App.tsx";
import { IndexPage } from "pages/index.tsx";
import { ContestsPage } from "pages/contests.tsx";
import { ContestPage } from "pages/contest.tsx";
import { CreationPage } from "pages/creation.tsx";

const routes: RouteObject[] = [
	{
		path: '/',
		element: <App/>,
		children: [
			{
				index: true,
				path: "",
				element: <IndexPage/>,
			},
			{
				path: "contests",
				element: <ContestsPage/>,
			},
			{
				path: "contests/new",
				element: <CreationPage/>,
			},
			{
				path: "contests/:contestId",
				element: <ContestPage/>,
			},
			{
				path: "*",
				element: <IndexPage/>
			}
		]
	}
]

export const router = createBrowserRouter(routes);