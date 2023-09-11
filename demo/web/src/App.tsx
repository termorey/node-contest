import React from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "./widgets/menu";

export const App: React.FC = () => {
	return (
		<>
			<Menu />
			<div className={"flex place-content-center place-items-center p-8"}>
				<Outlet />
			</div>
		</>
	);
};
