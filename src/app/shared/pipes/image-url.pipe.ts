import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(posterPath: string | null, size = 'w200'): string {
    if (!posterPath) return 'images/no-poster.png';
    return `${environment.tmdbImageUrl}/${size}${posterPath}`;
  }
}