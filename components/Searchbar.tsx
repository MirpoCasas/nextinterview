import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, permUseStore} from "@/components/store";
import { useEffect, useState } from "react";

const schema = z.object({
  query: z.string().min(1, { message: "Must be at least 1 character" })
  .max(10, { message: "Must be less than 10 characters" })
});

type Inputs = z.infer<typeof schema>;

export default function Searchbar( props : {error : string | undefined}) {
  const setQuery = useStore((state) => state.setQuery);
  const permquery = permUseStore((state) => state.permquery);
  const { register, handleSubmit, formState: {errors, isSubmitting}, setValue } = useForm<Inputs>({resolver: zodResolver(schema)});

  useEffect(() => {
    if (permquery) {
      console.log("permquery: " + permquery);
      setValue("query", permquery);
    }
  },[setValue, permquery]);

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setQuery(data.query);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col aligncenter gap-[15px] items-center">
      <Input type="text" placeholder={permquery ? permquery : "Search Terms"} {...register("query", { required: true })}></Input>
      <Button type="submit">Search</Button>
      {errors.query && <p className="text-red-500">{errors.query.message}</p>}
      {props.error && <p className="text-red-500">{props.error}</p>}
    </form>
  );
}