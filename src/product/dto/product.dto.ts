import { z } from 'zod';

export const createProductSchema = z
  .object({
    companyName: z.string({ required_error: 'company name is required' }),
    numberOfUsers: z.number({
      required_error: 'number of users is required',
    }),
    numberOfProducts: z.number({
      required_error: 'number of products is required',
    }),
    percentage: z.number({ required_error: 'percentage is required' }),
    userId: z.number({ required_error: 'userId is required' }),
  })
  .refine(
    (data) =>
      (data.numberOfUsers / data.numberOfProducts) * 100 == data.percentage,
    {
      message: 'percentage caculated is not correct',
      path: ['percentage'],
    },
  );

export type CreateProductDto = z.infer<typeof createProductSchema>;
