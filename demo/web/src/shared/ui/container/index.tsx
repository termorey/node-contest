import React from "react";

export const Container: React.FC<React.PropsWithChildren> = ({children}) => (
	<div className={"max-w-screen-xl w-full bg-white rounded p-4"}>
		{children}
	</div>
)