import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ResponseWithData,
  ResponseWithList,
} from 'src/interfaces/response.interface';

@Injectable()
export class GeneralResponse<T>
  implements NestInterceptor<T, ResponseWithData<T> | ResponseWithList<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseWithData<T> | ResponseWithList<T>> {
    return next.handle().pipe(
      map((data) => {
        const message = data?.message ?? 'Successful';
        if (data?.password) delete data.password;
        if (data?.pagination) {
          const pagination = data.pagination;
          delete data.pagination;
          return {
            isSuccess: true,
            message: message,
            data: [...data],
            pagination,
          };
        }
        return { isSuccess: true, message: message, data };
      }),
    );
  }
}
