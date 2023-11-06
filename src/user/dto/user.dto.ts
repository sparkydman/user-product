import { z } from 'zod';
import { Exclude } from 'class-transformer';

export const createUserSchema = z
  .object({
    name: z.string({ required_error: 'name is required' }),
    email: z
      .string({ required_error: 'email is required' })
      .email({ message: 'please provide a valid email' }),
    password: z
      .string({ required_error: 'password is required' })
      .min(5, { message: 'password should not be less than 5 characters' }),
    confirmPassword: z.string({
      required_error: 'confirmPassword is required',
    }),
    photo: z.string().optional(),
    role: z.string().default('user'),
  })
  .refine((data) => data.password == data.confirmPassword, {
    message: 'password does not match',
    path: ['confirmPassword'],
  });

export const loginUserSchema = z.object({
  email: z
    .string({ required_error: 'login email or password incorrect' })
    .email({ message: 'login email or password incorrect' }),
  password: z.string({ required_error: 'login email or password incorrect' }),
});

export const multiUsers = z.object({
  userIds: z
    .number({ required_error: 'userIds is required' })
    .array()
    .nonempty(),
});

export type LoginDto = z.infer<typeof loginUserSchema>;
export type MultiUsersDto = z.infer<typeof multiUsers>;

export type CreateUserDto = Omit<
  z.infer<typeof createUserSchema>,
  'confirmPassword'
>;

export interface LoginResponse extends UserEntity {
  accessToken: string;
  refreshToken: string;
}

export class UserEntity {
  id?: number;
  name?: string;
  email?: string;
  photo?: string;
  role?: string;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

export class UserEntityWithProducts<T> extends UserEntity {
  products: T;
}
