import { isDevMode } from '@angular/core';
import { map, pipe } from 'rxjs';
import { z } from 'zod';

export function verifyResponse<T extends z.ZodTypeAny>(zodObj: T) {
  return pipe(
    map((response) => {
      if (isDevMode()) {
        const result = zodObj.safeParse(response);

        if (!result.success) {
          console.error(result.error);
        }
      }
      return response as z.infer<T>;
    })
  );
}
