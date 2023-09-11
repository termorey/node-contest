import axios, { AxiosPromise } from "axios";
import { $user } from "shared/store/user";

const content = axios.create({
	baseURL: "http://localhost:4000/api/"
})

export const Api: {
	contests: {
		create: (config: Config) => AxiosPromise<ContestShortInfo | null>;
		getAll: () => AxiosPromise<ContestShortInfo[]>;
		getAllById: (contestId: string) => AxiosPromise<ContestShortInfo[]>;
		getById: (contestId: string) => AxiosPromise<ContestInfo | null>;
	};
	steps: {
		make: (data: {contestId: string; position: Position}) => AxiosPromise<{result: boolean}>;
		apply: (contestId: string) => AxiosPromise<{result: boolean}>;
		makeAndApply: (data: {contestId: string; position: Position; }) => AxiosPromise<{result: boolean}>;
	};
} = {
	contests: {
		create: (config) => content.post("contests/create", config),
		getAll: () => content.get('contests'),
		getAllById: (contestId) => content.get(`contests/by-id/${contestId}`),
		getById: (contestId) => content.get(`contests/id/${contestId}`),
	},
	steps: {
		make: ({contestId, position}) => content.post('steps/make', { contestId, step: { id: $user.getState(), position } }),
		apply: (contestId: string) => content.post(`steps/apply`, {contestId}),
		makeAndApply: ({contestId, position}) => content.post(`steps/make-and-apply`, {contestId, step: {id: $user.getState(), position}}),
	}
}

export type ContestShortInfo = { id: string; img: null | string; };
export type ContestInfo = {id: string; img: null | string; availablePositions: Position[]};
export type Position = [x: number, y: number];
export type Config = {
	fieldSize: Size;
	fieldsCount: Size;
}
interface Size {
	height: number;
	width: number;
}