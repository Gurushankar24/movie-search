import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie-service';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../spinner/spinner';
import { ToastService } from '../../services/toast.service';


@Component({
  selector: 'app-search-page',
  imports: [FormsModule, CommonModule, SpinnerComponent],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
})
export class SearchPage {
  searchedMovie: string = ''; // Default search to show something
  skeletonItems = Array.from({length: 5}, (_, i) => i + 1);
  movieService = inject(MovieService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  recentlyViewed = signal<any[]>([]);
  hasSearched = signal(false);

  ngOnInit() {
    this.movieService.isloading.set(false);
    this.loadRecentlyViewed();
    
    if (this.movieService.lastSearchQuery()) {
      this.searchedMovie = this.movieService.lastSearchQuery();
      // If we already have results for this search, don't re-search
      if (this.movieService.apiMoviesList().length > 0) {
        this.hasSearched.set(true);
        return;
      }
    }
    
    // Only search if we have a query and no results
    if (this.searchedMovie.trim()) {
      this.Onsearch();
    }
  }

  loadRecentlyViewed() {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      this.recentlyViewed.set(JSON.parse(saved));
    }
  }

  clearRecentlyViewed() {
    localStorage.removeItem('recentlyViewed');
    this.recentlyViewed.set([]);
  }

  Onsearch() {
    if (!this.searchedMovie.trim()) {
      this.hasSearched.set(false);
      this.movieService.apiMoviesList.set([]);
      return;
    }

    this.movieService.isloading.set(true);
    this.hasSearched.set(true);
    this.movieService.lastSearchQuery.set(this.searchedMovie);
    
    this.movieService.searchMovies(this.searchedMovie, 1).subscribe({
      next: (res) => {
        this.movieService.currentPage.set(1);
        
        if (res.Search) {
          const unique = res.Search.filter((currentVal: any, index: number, wholeArray: any) => {
            return (
              index ===
              wholeArray.findIndex((x: any) => {
                return currentVal.imdbID === x.imdbID;
              })
            );
          });
          this.movieService.apiMoviesList.set(unique);
          this.movieService.movieCount.set(res.totalResults);
        }
        
        this.movieService.isloading.set(false);
      },
      error: (err) => {
        this.movieService.apiMoviesList.set([]);
        this.movieService.movieCount.set('0');
        this.movieService.isloading.set(false);
      },
    });
  }

  onInputChange() {
    if (!this.searchedMovie.trim()) {
      this.hasSearched.set(false);
      this.movieService.apiMoviesList.set([]);
    }
  }

  onClick(data: any) {
    // Recently Viewed Logic
    let current = [...this.recentlyViewed()];
    const index = current.findIndex(m => m.imdbID === data.imdbID);
    
    if (index !== -1) {
      current.splice(index, 1);
    }
    
    current.unshift(data);
    if (current.length > 5) {
      current = current.slice(0, 5);
    }
    
    localStorage.setItem('recentlyViewed', JSON.stringify(current));
    this.recentlyViewed.set(current);

    this.movieService.selectedMovieData.set(data);
    this.router.navigate(['/movie-details']);
  }

  loadmore() {
    if (!this.searchedMovie.trim()) return;

    this.movieService.currentPage.update((page) => page + 1);
    
    this.movieService.searchMovies(this.searchedMovie, this.movieService.currentPage()).subscribe({
      next: (res) => {
        if (res.Response === 'True' && res.Search) {
          this.movieService.apiMoviesList.update((movies) => [...movies, ...res.Search]);
        } else {
          this.toastService.info(res.Error || 'No more movies found');
        }
      },
      error: (err) => {
      }
    });
  }
}
