import { createApi, createEvent, createStore, sample } from "effector";

export const $user = createStore<string>("");
const userApi = createApi($user, {
	setUser: (_, id: string) => id,
})

export const receivedUserId = createEvent<string>();
sample({
	clock: receivedUserId,
	target: userApi.setUser,
})