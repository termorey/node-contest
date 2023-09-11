import { Container } from "shared/ui/container";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { createEvent, sample } from "effector";
import { $contest, applyStepsFx, fetchContestInfoFx, sendStepAndApplyFx, sendStepToMakeFx } from "shared/store/contest";
import { useStore } from "effector-react";
import { Button } from "shared/ui/button";
import { Position } from "shared/api/api.ts";

const contestRequested = createEvent<string>();
sample({
	clock: contestRequested,
	target: fetchContestInfoFx,
});

const stepClickedAndApplied = createEvent<{ contestId: string; position: Position }>();
sample({
	clock: stepClickedAndApplied,
	target: sendStepAndApplyFx,
});
const stepClickedToMake = createEvent<{contestId: string; position: Position}>();
sample({
	clock: stepClickedToMake,
	target: sendStepToMakeFx,
})
const stepsApplied = createEvent<string>();
sample({
	clock: stepsApplied,
	target: applyStepsFx,
})

export const ContestPage = () => {
	const { contestId } = useParams();
	const contest = useStore($contest);

	const handleClickAndApply: (contestId: string, position: Position) => () => void = (contestId, position) => () => {
		stepClickedAndApplied({ contestId, position });
	};
	const handleClickToMake: (contestId: string, position: Position) => () => void = (contestId, position) => () => {
		stepClickedToMake({ contestId, position });
	};
	const handleApply: (contestId: string) => () => void = (contestId) => () => {
		stepsApplied(contestId);
	};

	useEffect(() => {
		if (contestId) contestRequested(contestId);
	}, []);

	return (
		<Container>
			{contest ? (
				<>
					{contest.img ? <img src={contest.img} alt={""} /> : null}
					<span>{`Contest ID:${contest.id}`}</span>
					<div className={"grid grid-cols-2 gap-4"}>
						<div className={"flex flex-col justify-start items-stretch gap-2"}>
							<h3>{"Click once and apply"}</h3>
							<span>{"Available steps:"}</span>
							{contest.availablePositions.length > 0 ? (
								<div className={"flex flex-row flex-wrap justify-start items-center gap-2"}>
									{contest.availablePositions.map(([x, y]) =>
										<Button onClick={handleClickAndApply(contest.id, [x, y])}
												key={`${x}_${y}`}>{`[${x} ${y}]`}</Button>,
									)}
								</div>
							) : (
								<span>{"no available steps"}</span>
							)}
						</div>
						<div className={"flex flex-col justify-start items-stretch gap-2"}>
							<h3>{"Click many and apply after"}</h3>
							<p><b>{"New tab = new user"}</b><br/>{"one user = one step per apply"}</p>
							<span>{"Available steps:"}</span>
							{contest.availablePositions.length > 0 ? (
								<>
									<Button onClick={handleApply(contest.id)}>{"Apply"}</Button>
									<div className={"flex flex-row flex-wrap justify-start items-center gap-2"}>
										{contest.availablePositions.map(([x, y]) =>
											<Button onClick={handleClickToMake(contest.id, [x, y])}
													key={`${x}_${y}`}>{`[${x} ${y}]`}</Button>,
										)}
									</div>
								</>
							) : (
								<span>{"no available steps"}</span>
							)}
						</div>
					</div>
				</>
			) : null}
		</Container>
	);
};