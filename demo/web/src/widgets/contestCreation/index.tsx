import React from "react";
import { cva } from "class-variance-authority";
import { useFormik } from "formik";
import * as yup from "yup";
import { createEvent, sample } from "effector";
import { Button } from "shared/ui/button";
import { createContestFx } from "shared/store/contest";
import { useUnit } from "effector-react";

export interface FormValues {
	fieldSizeX: number;
	fieldSizeY: number;
	fieldsCountX: number;
	fieldsCountY: number;
}

const initialValues: FormValues = {
	fieldSizeX: 700,
	fieldSizeY: 500,
	fieldsCountX: 5,
	fieldsCountY: 3,
}

const validationSchema = yup.object({
	fieldSizeX: yup.number().required().min(300, "Размер X меньше 300px"),
	fieldSizeY: yup.number().required().min(300, "Размер Y меньше 300px"),
	fieldsCountX: yup.number().required().min(3, "Не может быть менее 3 чанков в ширину"),
	fieldsCountY: yup.number().required().min(3, "Не может быть менее 3 чанков в высоту"),
})

const formSubmitted = createEvent<FormValues>();
sample({
	clock: formSubmitted,
	target: createContestFx,
})

export const ContestCreation = () => {
	const pending = useUnit(createContestFx.pending);
	const { initialValues: defaultValues, handleSubmit , errors } = useFormik<FormValues>({
		initialValues,
		validationSchema,
		onSubmit: formSubmitted,
	});

	return (
		<form onSubmit={handleSubmit} className={"flex flex-col justify-start items-stretch gap-6"}>
			<FieldsRow columns={3}>
				<Field>
					<Title>{"Размер поля"}</Title>
					<Description>
						{"Фактически указывается размер экпортируемого изображения"}
					</Description>
				</Field>
				<Field>
					<span>{"x [px]"}</span>
					<NumberInput name={"fieldSizeX"} min={3} defaultValue={defaultValues.fieldSizeX}/>
				</Field>
				<Field>
					<span>{"y [px]"}</span>
					<NumberInput name={"fieldSizeY"} min={3} defaultValue={defaultValues.fieldSizeY}/>
				</Field>
			</FieldsRow>
			<FieldsRow columns={3}>
				<Field>
					<Title>{"Количество полей"}</Title>
					<Description>{"Размер содаваемых чанков на поле"}</Description>
				</Field>
				<Field>
					<span>{"x [number]"}</span>
					<NumberInput name={"fieldsCountX"} min={3} defaultValue={defaultValues.fieldsCountX}/>
				</Field>
				<Field>
					<span>{"y [number]"}</span>
					<NumberInput name={"fieldsCountY"} min={3} defaultValue={defaultValues.fieldsCountY}/>
				</Field>
			</FieldsRow>
			{Object.keys(errors).map((field) => <span className={'text-red-700 font-bold'}>{`Error: ${errors[field as keyof typeof errors]}`}</span>)}
			{pending ? (<span>{"Pending..."}</span>) : (<Button>{"Create"}</Button>)}
		</form>
	);
};

export const FieldsRow: React.FC<React.PropsWithChildren & { columns: number }> = ({ children, columns }) => (
	<div className={`grid gap-4 grid-cols-${columns}`}>{children}</div>);
export const Field: React.FC<React.PropsWithChildren> = ({ children }) => (
	<div className={"flex flex-col justify-start items-stretch gap-4"}>{children}</div>);
export const Title: React.FC<React.PropsWithChildren> = ({children}) => (<span><b>{children}</b></span>);
export const Description: React.FC<React.PropsWithChildren> = ({children}) => (<p>{children}</p>);

const input = cva("bg-gray-50 py-1 px-2 focus:bg-gray-100 focus:drop-shadow focus:outline-0");
export const NumberInput: React.FC<{name: string; min?: number; defaultValue?: number; onChange?: React.ChangeEventHandler<HTMLInputElement>}> = ({name, onChange, min, defaultValue}) => (<input className={input()} name={name} type={"number"} onChange={onChange} required={true} min={min} defaultValue={defaultValue} />);
