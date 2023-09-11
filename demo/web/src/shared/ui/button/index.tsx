import React from "react";
import { cva } from "class-variance-authority";

interface Props extends React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>> {

}

const button = cva("button", {
    variants: {
        intent: {
            regular: ["bg-blue-600 hover:bg-blue-500", "text-white", "px-2", "rounded"],
        },
    },
    defaultVariants: {
        intent: "regular",
    },
});

export const Button: React.FC<Props> = ({ children, onClick }) => (
    <button className={button()} onClick={onClick}>{children}</button>);