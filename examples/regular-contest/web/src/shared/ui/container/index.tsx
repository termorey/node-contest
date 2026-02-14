import React from "react";

export const Container: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className={"max-w-(--breakpoint-xl) w-full bg-white rounded-sm p-4"}>
    {children}
  </div>
);
