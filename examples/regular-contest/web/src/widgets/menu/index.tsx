import React from "react";
import { NavLink } from "react-router-dom";
import { cva } from "class-variance-authority";

export const Menu = () => (
	<menu className={"flex flex-col justify-center items-stretch p-4 bg-white"}>
		<nav className={"flex flex-row justify-center items-stretch"}>
			<ul className={"flex flex-row justify-between gap-2"}>
				<MenuItem link={""} text={"Главная"} />
				<MenuItem link={"contests"} text={"Конкурсы"} />
			</ul>
		</nav>
	</menu>
);

const menuLink = cva("", {
	variants: {
		intent: {
			regular: ["text-blue-800", "hover:text-blue-600"],
			active: ["text-blue-600", "underline"],
		},
	},
	defaultVariants: {
		intent: "regular",
	},
});
const MenuItem: React.FC<{ link: string; text: string; }> = ({ link, text }) => (
	<li><NavLink className={({ isActive }) => menuLink({ intent: isActive ? "active" : "regular" })}
				 to={link}>{text}</NavLink></li>);