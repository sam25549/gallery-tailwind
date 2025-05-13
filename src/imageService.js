
// https://unsplash.com/es/%C3%BAnete
const API_KEY = "XYpSwe2Jt7R1akS-u8xGkTpwiNy1-X-h7n5BTq9imr4"
export class ImageService {
    constructor() {
        this.BASE_URL = 'https://api.unsplash.com';
        this.imagesPerPage = 30;
    }

    async searchImages(query, page = 1) {
        try {
            const response = await fetch(
                `${this.BASE_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${this.imagesPerPage}`,
                {
                    headers: {
                        'Authorization': `Client-ID ${API_KEY}`
                    }
                }
            );
            if (!response.ok) {
                throw new Error('Error al buscar imágenes');
            }

            const data = await response.json();
            return {
                results: data.results,
                total: data.total,
                totalPages: Math.ceil(data.total / this.imagesPerPage)
            };
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
}

export class ImageGallery {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.paginationContainer = document.getElementById('pagination');
        this.imageService = new ImageService();
        this.currentPage = 1;
        this.currentQuery = '';
        this.isLoading = false;
        this.totalPages = 0;
        this.hasMoreResults = true;
        this.observer = null;
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading && this.hasMoreResults) {
                    this.loadMoreImages();
                }
            });
        }, options);

        // Observe the last element of the grid
        this.observeLastElement();
    }

    observeLastElement() {
        const lastElement = this.container.lastElementChild;
        if (lastElement) {
            this.observer.observe(lastElement);
        }
    }

    async searchImages(query) {
        this.currentQuery = query;
        this.currentPage = 1;
        this.hasMoreResults = true;
        this.clearGallery();
        await this.loadImages();
    }

    clearGallery() {
        this.container.innerHTML = '';
        this.clearPagination();
    }

    clearPagination() {
        if (this.paginationContainer) {
            this.paginationContainer.innerHTML = '';
        }
    }

    async loadImages() {
        try {
            this.isLoading = true;
            const response = await this.imageService.searchImages(this.currentQuery, this.currentPage);
            const images = response.results;
            this.totalPages = response.totalPages;

            if (images.length === 0) {
                this.showNoMoreResults();
                return;
            }

            images.forEach(image => {
                const imageElement = this.createImageElement(image);
                this.container.appendChild(imageElement);
            });

            // Update observer to watch the new last element
            this.observeLastElement();

            this.currentPage++;
            this.hasMoreResults = this.currentPage <= this.totalPages;

            if (!this.hasMoreResults) {
                this.showNoMoreResults();
            }

        } catch (error) {
            console.error('Error al cargar imágenes:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    showNoMoreResults() {
        const noMoreResults = document.createElement('div');
        noMoreResults.className = 'w-full text-center py-4 text-gray-500 text-lg';
        noMoreResults.textContent = 'No hay más resultados';
        this.container.appendChild(noMoreResults);
    }

    createImageElement(image) {
        const div = document.createElement('div');
        div.className = 'box';

        const img = document.createElement('img');
        img.src = image.urls.regular;
        img.alt = image.alt_description || 'Imagen de Unsplash';
        img.loading = 'lazy';

        // Determinar las clases según las dimensiones
        const width = image.width;
        const height = image.height;
        const ratio = width / height;

        if (ratio > 1.5) {
            // Imagen landscape (más ancha que alta)
            div.classList.add('box-landscape');
        } else if (ratio < 0.75) {
            // Imagen portrait (más alta que ancha)
            div.classList.add('box-portrait');
        } else if (width > 800 && height > 800) {
            // Imagen grande (doble)
            div.classList.add('box-double');
        }

        div.appendChild(img);
        return div;
    }

    async loadMoreImages() {
        if (!this.isLoading && this.hasMoreResults) {
            await this.loadImages();
        }
    }
} 
