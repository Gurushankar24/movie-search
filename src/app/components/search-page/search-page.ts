import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie-service';

@Component({
  selector: 'app-search-page',
  imports: [FormsModule],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
})
export class SearchPage {
  searchedMovie: string = '';
  private movieService = inject(MovieService);
  apiMoviesList : any;
  ngOnInit(){
    console.log('sfd');
  }
  Onsearch() {
    console.log(this.searchedMovie)
    this.movieService.searchMovies(this.searchedMovie).subscribe((res)=>{
      console.log(res)
      this.apiMoviesList = res;
    },
  (err)=>{
  console.log(err)

  })
  }
}
