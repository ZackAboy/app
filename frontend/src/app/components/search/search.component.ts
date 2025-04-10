import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AppComponent } from '../../app.component';

interface Artwork {
  id: string;
  title: string;
  date: string;
  image: string;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
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

  activeTab: 'info' | 'artworks' = 'info';
  inputFocused: boolean = false;

  selectedArtwork: Artwork | null = null;
  artworkCategories: any[] = [];
  artworksLoading: boolean = false;

  similarArtists: any[] = [];
  isLoggedIn: boolean = false;

  favoriteArtistIds = new Set<string>();

  constructor(private http: HttpClient, private userService: UserService, private appComponent: AppComponent) {
    this.userService.loginState$.subscribe((state) => {
      this.isLoggedIn = state;
      if (this.isLoggedIn) {
        this.fetchFavorites();
      } else {
        this.favoriteArtistIds.clear();
      }
    });
  }

  fetchFavorites(): void {
    if (!this.isLoggedIn) return;
    this.http.get<any[]>(`http://localhost:8080/api/user/favorites`, {
      withCredentials: true
    }).subscribe({
      next: (favs) => {
        this.favoriteArtistIds = new Set(favs.map(f => f.artistId));
      },
      error: () => {
        this.favoriteArtistIds.clear();
      }
    });
  }

  toggleFavorite(artistId: string, event: MouseEvent): void {
    event.stopPropagation();

    const url = this.favoriteArtistIds.has(artistId)
      ? `http://localhost:8080/api/user/favorites/remove`
      : `http://localhost:8080/api/user/favorites/add`;

    this.http.post(url, { artistId }, { withCredentials: true }).subscribe({
      next: () => {
        if (this.favoriteArtistIds.has(artistId)) {
          this.favoriteArtistIds.delete(artistId);
          this.appComponent.showToast('Removed from favorites', 'danger');
        } else {
          this.favoriteArtistIds.add(artistId);
          this.appComponent.showToast('Added to favorites', 'success');
        }
      },
      error: () => {
        this.appComponent.showToast('Failed to update favorites', 'danger');
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) return;

    this.errorMessage = '';
    this.artists = [];
    this.artistDetails = null;
    this.similarArtists = [];
    this.selectedArtistId = null;
    this.showArtistDetails = false;
    this.loading = true;

    this.http.get<any[]>(`http://localhost:8080/api/search?q=${this.searchTerm}`, {
      withCredentials: true
    }).subscribe({
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
    this.similarArtists = [];
    this.errorMessage = '';
    this.activeTab = 'info';

    this.http.get<any>(`http://localhost:8080/api/artist?id=${artistId}`, {
      withCredentials: true
    }).subscribe({
      next: (res) => {
        this.artistDetails = { ...res, id: artistId };
        this.similarArtists = res.similarArtists || [];
        this.artistLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load artist details.';
        this.artistLoading = false;
      }
    });
  }

  switchTab(tab: 'info' | 'artworks'): void {
    this.activeTab = tab;
    if (
      tab === 'artworks' &&
      this.artistDetails &&
      !Array.isArray(this.artistDetails.artworks)
    ) {
      this.fetchArtworks(this.artistDetails.id);
    }
  }

  fetchArtworks(artistId: string): void {
    this.artworksLoading = true;
    this.http.get<Artwork[]>(`http://localhost:8080/api/artworks?artist_id=${artistId}&size=10`, {
      withCredentials: true
    }).subscribe({
      next: (artworks) => {
        this.artistDetails.artworks = artworks;
        this.artworksLoading = false;
      },
      error: (err) => {
        console.error("Artworks error:", err);
        this.artistDetails.artworks = [];
        this.artworksLoading = false;
      }
    });
  }

  fetchCategories(artworkId: string): void {
    this.http.get<any[]>(`http://localhost:8080/api/categories?artwork_id=${artworkId}`, {
      withCredentials: true
    }).subscribe({
      next: (categories) => {
        this.artworkCategories = categories;
        this.selectedArtwork = (this.artistDetails.artworks as Artwork[]).find((a: Artwork) => a.id === artworkId) || null;
        const modalElement = document.getElementById('categoryModal');
        if (modalElement) new (window as any).bootstrap.Modal(modalElement).show();
      },
      error: (err) => {
        console.error('Failed to fetch categories:', err);
        this.artworkCategories = [];
      }
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.artists = [];
    this.similarArtists = [];
    this.selectedArtistId = null;
    this.artistDetails = null;
    this.errorMessage = '';
    this.showArtistDetails = false;
  }
}