import React, { useEffect } from "react";
import { cva } from "class-variance-authority";
import { mounted } from "./model";
import { useStore, useUnit } from "effector-react";
import { $contests, fetchContestsFx } from "shared/store/contests";
import { NavLink } from "react-router-dom";
import { Button } from "shared/ui/button";

interface Props {

}

const contestList = cva("", {
	variants: {
		intent: {
			regular: ["grid", "grid-cols-3", "gap-2"],
		},
	},
	defaultVariants: {
		intent: "regular",
	},
});

export const ContestsList: React.FC<Props> = () => {
	const contests = useStore($contests);
	const pending = useUnit(fetchContestsFx.pending);

	useEffect(() => {
		mounted();
	}, []);

	return (
		<div className={contestList({})}>
			{pending ? (<span>{"Pending..."}</span>) :
				contests.length > 0 ?
					contests.map(({ id, img }) => (
						<div
							key={id}
							className={"flex flex-col justify-end items-stretch bg-white rounded drop-shadow overflow-hidden"}>
							{img ? <img src={img} alt={""} className={"aspect-video"} /> : null}
							<div className={"flex flex-col justify-start items-stretch gap-2 p-2"}>
								<span>{`Contest ID:${id}`}</span>
								<div className={"flex flex-row justify-center items-center"}><NavLink
									to={`/contests/${id}`}><Button>{`Show`}</Button></NavLink></div>
							</div>
						</div>
					)) : (
						<span>{"No contests created yet"}</span>
					)}
		</div>
	);
};