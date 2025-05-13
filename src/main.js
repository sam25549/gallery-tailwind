import { ImageGallery } from './imageService.js';

class SearchForm {
  constructor() {
    this.form = document.getElementById('searchForm');
    this.input = document.getElementById('searchInput');
    this.errorElement = document.getElementById('searchError');
    this.gallery = new ImageGallery('grid-container');
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.input.addEventListener('input', (e) => this.handleInput(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const query = this.input.value.trim();
    
    if (!this.validateQuery(query)) {
      return;
    }

    try {
      this.hideError();
      await this.gallery.searchImages(query);
    } catch (error) {
      this.showError('Error al buscar imágenes. Por favor, intenta de nuevo.');
    }
  }

  handleInput() {
    const query = this.input.value.trim();
    this.validateQuery(query);
  }

  validateQuery(query) {
    if (query.length < 3) {
      this.showError('La búsqueda debe tener al menos 3 caracteres');
      return false;
    }

    if (query.length > 50) {
      this.showError('La búsqueda no puede tener más de 50 caracteres');
      return false;
    }

    this.hideError();
    return true;
  }

  showError(message) {
    this.errorElement.textContent = message;
    this.errorElement.classList.remove('hidden');
  }

  hideError() {
    this.errorElement.classList.add('hidden');
  }
}

const buscador = new SearchForm();