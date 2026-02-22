import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule
  ],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss'
})
export class SearchBar implements OnChanges {
  @Input() initialQuery = '';
  @Output() search = new EventEmitter<string>();

  searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(value => {
      this.search.emit(value);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialQuery'] && this.initialQuery) {
      this.searchControl.setValue(this.initialQuery, { emitEvent: false });
    }
  }
}