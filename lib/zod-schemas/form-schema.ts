import z from "zod/v3";

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  password: z.string().optional(),
  pushups: z.coerce.number()
    .nonnegative('I know for a fact you did not do negative pushups.')
})

export default formSchema;
