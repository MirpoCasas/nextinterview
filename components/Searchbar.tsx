import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/components/store";

const schema = z.object({
  query: z.string().min(1, { message: "Must be at least 1 character" })
  .max(10, { message: "Must be less than 10 characters" })
});

type Inputs = z.infer<typeof schema>;

export default function Searchbar() {
  const setQuery = useStore((state) => state.setQuery);
  const query = useStore((state) => state.query);
  const { register, handleSubmit, formState: {errors, isSubmitting} } = useForm<Inputs>({resolver: zodResolver(schema)});

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setQuery(data.query);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col aligncenter gap-[15px] items-center">
      <Input type="text" placeholder={query ? query : "Search Terms"} {...register("query", { required: true })}></Input>
      <Button type="submit">Search</Button>
      {errors.query && <p className="text-red-500">{errors.query.message}</p>}
    </form>
  );
}