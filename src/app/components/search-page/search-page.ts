import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie-service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-page',
  imports: [FormsModule],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
})
export class SearchPage {
  searchedMovie: string = '';
  private movieService = inject(MovieService);
  private router = inject(Router)
  apiMoviesList = signal<any[]>([]);
  movieCount = signal('');
  selectedMovieDetails = signal('')
  ngOnInit() {
    console.log('sfd');
  }
  Onsearch() {
    console.log(this.searchedMovie);
    this.movieService.searchMovies(this.searchedMovie).subscribe(
      (res) => {
        console.log(res);
        // this.apiMoviesList = res.Search;
        // this.movieCount = res.totalResults
        this.apiMoviesList.set(res.Search);
        this.movieCount.set(res.totalResults);
        console.log(this.apiMoviesList);
      },
      (err) => {
        console.log(err);
      },
    );
  }

onClick(data: any) {
  console.log("1. Clicked movie ID:", data.imdbID);
  this.movieService.selectedMovieData.set(data)
  this.router.navigate(['/movie-details'])
}
} 
