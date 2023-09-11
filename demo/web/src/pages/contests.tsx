import { Container } from "shared/ui/container";
import { ContestsList } from "../widgets/contestsList";
import { NavLink } from "react-router-dom";
import { Button } from "../shared/ui/button";

export const ContestsPage = () => {

	return (
		<Container>
			<div className={"flex flex-row justify-end items-stretch mb-4"}>
				<NavLink to={"/contests/new"}><Button>{"Create"}</Button></NavLink>
			</div>
			<ContestsList />
		</Container>
	);
};