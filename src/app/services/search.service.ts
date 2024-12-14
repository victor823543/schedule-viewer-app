import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { Entity } from '../models/schedule.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchTerms = new BehaviorSubject<{ [key: string]: string }>({});

  setSearchTerm(filterType: string, term: string): void {
    this.searchTerms.next({
      ...this.searchTerms.value,
      [filterType]: term.toLowerCase()
    });
  }

  // Filters entities based on the search term for the specified filter type
  filterEntities(filterType: string, entities$: Observable<Entity[]>): Observable<Entity[]> {
    return combineLatest([entities$, this.searchTerms]).pipe(
      map(([entities, terms]) => {
        const term = terms[filterType]?.toLowerCase();
        if (!term) return entities;

        return entities.filter((entity) => entity.displayName.toLowerCase().includes(term));
      })
    );
  }
}
