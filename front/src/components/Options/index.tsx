"use client"

import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";

export interface IOptionsProps {
  title: string;
  description?: string;
  content?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
}
export default function Options(props: IOptionsProps) {
  return (
    <Card
      onClick={props.onClick}
      className={
        props.disabled ?
          "overflow-hidden w-full h-44 hover:bg-neutral-600 hover:opacity-50 cursor-not-allowed hover:text-black group hover:z-10"
          :
          `overflow-hidden w-full h-44 hover:bg-gradient-to-br from-yellow-200 to-yellow-500 ${props.isLoading ? "cursor-not-allowed" : "cursor-pointer"} hover:text-black group hover:scale-[1.01] transition-transform duration-300 hover:z-10`
      }
    >
      <CardHeader>
        <CardTitle>
          {props.title}
        </CardTitle>
        <CardDescription className="group-hover:text-black">
          {props.content}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-base">
          {props.description}
        </p >
      </CardContent>
      <CardFooter className="flex justify-end">
        {props.isLoading ? <Loader2 className="w-48 h-48 animate-spin-custom text-zinc-800 -mr-12 -mt-20 -z-10" /> : props.icon}
      </CardFooter>
    </Card>
  );
}