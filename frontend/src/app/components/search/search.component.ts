import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  imports: [FormsModule, CommonModule]
})
export class SearchComponent {
  searchTerm: string = '';
  artists: any[] = [];
  errorMessage: string = '';
  loading: boolean = false;

  selectedArtistId: string | null = null;
  artistDetails: any = null;
  artistLoading: boolean = false;
  showArtistDetails: boolean = false;

  constructor(private http: HttpClient) {}

  onSearch(): void {
    if (!this.searchTerm.trim()) return;

    this.errorMessage = '';
    this.artists = [];
    this.artistDetails = null;
    this.selectedArtistId = null;
    this.showArtistDetails = false;
    this.loading = true;

    this.http.get<any[]>(`http://localhost:8080/api/search?q=${this.searchTerm}`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.artists = res;
          if (res.length === 0) this.errorMessage = 'No results found.';
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Search failed.';
          this.loading = false;
        }
      });
  }

  onArtistClick(artistId: string): void {
    this.selectedArtistId = artistId;
    this.showArtistDetails = true;
    this.artistLoading = true;
    this.artistDetails = null;
    this.errorMessage = '';

    this.http.get<any>(`http://localhost:8080/api/artist?id=${artistId}`, { withCredentials: true }).subscribe({
      next: (res) => {
        this.artistDetails = res;
        this.fetchArtworks(artistId);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load artist details.';
        this.artistLoading = false;
      }
    });
  }

  fetchArtworks(artistId: string): void {
    this.http.get<any[]>(`http://localhost:8080/api/artworks?artist_id=${artistId}`, { withCredentials: true }).subscribe({
      next: (artworks) => {
        this.artistDetails.artworks = artworks;
        this.artistLoading = false;
      },
      error: (err) => {
        this.artistDetails.artworks = [];
        this.artistLoading = false;
      }
    });
  }

  backToResults(): void {
    this.showArtistDetails = false;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.artists = [];
    this.selectedArtistId = null;
    this.artistDetails = null;
    this.errorMessage = '';
    this.showArtistDetails = false;
  }
}