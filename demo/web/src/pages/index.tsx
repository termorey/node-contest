import { NavLink } from "react-router-dom";
import { useStore } from "effector-react";
import { Container } from "../shared/ui/container";
import { Button } from "../shared/ui/button";
import { $contests } from "../shared/store/contests";

export const IndexPage = () => {
	const contests = useStore($contests);

	return (
		<Container>
			<div className={"flex flex-row justify-end items-stretch mb-4"}>
				<NavLink to={"/contests/new"}><Button>{"Create"}</Button></NavLink>
			</div>
			<div className={"flex flex-col justify-start items-stretch gap-4"}>
				<NavLink to={"/contests"}>
					<div className={"flex flex-row justify-start items-stretch gap-2 bg-white p-2 drop-shadow"}>
						<span>{`Total contests: ${contests.length}`}</span>
						<span className={"ml-auto"}><Button>{"Go to contests"}</Button></span>
					</div>
				</NavLink>
			</div>
		</Container>
	);
};