import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragEnd } from '@angular/cdk/drag-drop';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-liked',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './liked.html',
  styleUrl: './liked.scss',
  animations: [
    trigger('cardAnimation', [
      transition(':leave', [
        style({ transform: 'translateX(0)', opacity: 1, height: '*' }),
        animate('500ms ease-out', keyframes([
          style({ transform: 'translateX(-20px)', offset: 0.1 }),
          style({ transform: 'translateX(20px)', offset: 0.2 }),
          style({ transform: 'translateX(-20px)', offset: 0.3 }),
          style({ transform: 'translateX(20px)', offset: 0.4 }),
          style({ transform: 'translateX(-100%)', opacity: 0, height: '*', offset: 0.8 }),
          style({ height: '0', margin: '0', padding: '0', opacity: 0, offset: 1.0 })
        ]))
      ])
    ]),
    trigger('swipeOff', [
      transition('* => flyOff', [
        animate('400ms ease-in', style({ transform: 'translateX(-100%) scale(0.8)', opacity: 0, height: 0, margin: 0, padding: 0 }))
      ])
    ])
  ]
})
export class Liked {
  existingMovies = signal<any[]>([]);
  private router = inject(Router);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    const temp = localStorage.getItem('likedMovies');
    this.existingMovies.set(temp ? JSON.parse(temp) : []);
  }

  onBack() {
    this.router.navigate(['/search']);
  }

  onDragEnded(event: CdkDragEnd, movie: any) {
    const distance = event.distance.x;
    const cardWidth = event.source.element.nativeElement.offsetWidth;
    
    // If dragged more than 40% to the left
    if (distance < -(cardWidth * 0.4)) {
      this.removeMovie(movie, true);
    } else {
      event.source.reset();
    }
  }

  removeMovie(movie: any, fromSwipe = false) {
    const currentList = this.existingMovies();
    const newList = currentList.filter(m => m.imdbID !== movie.imdbID);
    
    // Small delay to allow animation if needed, though :leave trigger handles most
    setTimeout(() => {
      this.existingMovies.set(newList);
      localStorage.setItem('likedMovies', JSON.stringify(newList));
      this.toastService.info('Removed from Liked 💔');
    }, fromSwipe ? 0 : 100); 
  }
}
