import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service'; // adjust path if needed

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favoriteArtists: any[] = [];
  private intervalId: any;

  constructor(private http: HttpClient, private toastService: ToastService) {}

  ngOnInit(): void {
    this.fetchFavorites();
    this.intervalId = setInterval(() => this.updateFavoriteTimes(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  fetchFavorites(): void {
    this.http.get<any[]>('http://localhost:8080/api/user/favorites', { withCredentials: true }).subscribe({
      next: (data) => {
        this.favoriteArtists = data;
        this.updateFavoriteTimes();
      },
      error: (err) => {
        console.error('Failed to fetch favorites:', err);
      }
    });
  }

  updateFavoriteTimes(): void {
    const now = Date.now();
    this.favoriteArtists.forEach((artist) => {
      const addedTime = new Date(artist.addedAt).getTime();
      const seconds = Math.floor((now - addedTime) / 1000);

      if (seconds < 60) {
        artist.timeAgo = `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        artist.timeAgo = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        artist.timeAgo = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(seconds / 86400);
        artist.timeAgo = `${days} day${days !== 1 ? 's' : ''} ago`;
      }
    });
  }

  removeFromFavorites(artistId: string): void {
    this.http.post('http://localhost:8080/api/user/favorites/remove', { artistId }, { withCredentials: true })
      .subscribe({
        next: () => {
          this.favoriteArtists = this.favoriteArtists.filter(a => a.artistId !== artistId);
          this.toastService.show('Removed from favorites', 'success');
        },
        error: (err) => {
          console.error('Failed to remove artist:', err);
          this.toastService.show('Removed from favorites', 'success');
        }
      });
  }
}