import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { AnyZodObject, ZodEffects } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: AnyZodObject | ZodEffects<any>) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, _metadata: ArgumentMetadata) {
    try {
      this.schema.parse(value);
    } catch (e: any) {
      console.error(e);
      throw new BadRequestException(e.errors);
    }
    return value;
  }
}
