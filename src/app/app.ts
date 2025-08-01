import { Component, signal, OnInit, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// Interfaces
interface Rating {
  rate: number;
  count: number;
}

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: Rating;
}

interface CartItem extends Product {
  quantity: number;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('Angular E-commerce');

  // Signals for reactive state management
  products = signal<Product[]>([]);
  categories = signal<string[]>([]);
  cart = signal<CartItem[]>([]);
  currentFilter = signal<string>('all');
  searchQuery = signal<string>('');
  featuredProduct = signal<Product | null>(null);
  isLoading = signal<boolean>(false);
  showApiWarning = signal<boolean>(false);

  // Computed values
  filteredProducts = computed(() => {
    const products = this.products();
    const filter = this.currentFilter();
    const search = this.searchQuery().toLowerCase();

    let filtered = products.filter(product => {
      const matchesCategory = filter === 'all' || product.category === filter;
      const matchesSearch = !search ||
        product.title.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });

    return filtered;
  });

  cartCount = computed(() => {
    return this.cart().reduce((total, item) => total + item.quantity, 0);
  });

  cartTotal = computed(() => {
    return this.cart().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  private readonly API_BASE_URL = 'https://fakestoreapi.com';

  // Sample data as fallback
  private readonly sampleProducts: Product[] = [
    {
      id: 1,
      title: "Premium Wireless Headphones",
      price: 129.99,
      description: "High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      rating: { rate: 4.5, count: 120 }
    },
    {
      id: 2,
      title: "Elegant Diamond Ring",
      price: 899.99,
      description: "Beautiful diamond ring crafted with precision. Perfect for special occasions and as a symbol of love.",
      category: "jewelery",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=300&fit=crop",
      rating: { rate: 4.8, count: 89 }
    },
    {
      id: 3,
      title: "Stylish Men's Jacket",
      price: 79.99,
      description: "Modern and comfortable men's jacket. Perfect for casual and semi-formal occasions. Available in multiple colors.",
      category: "men's clothing",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop",
      rating: { rate: 4.2, count: 156 }
    },
    {
      id: 4,
      title: "Women's Summer Dress",
      price: 59.99,
      description: "Light and comfortable summer dress for women. Perfect for warm weather and casual outings.",
      category: "women's clothing",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop",
      rating: { rate: 4.6, count: 203 }
    },
    {
      id: 5,
      title: "Smart Fitness Watch",
      price: 199.99,
      description: "Advanced fitness watch with heart rate monitoring, GPS tracking, and smartphone connectivity.",
      category: "electronics",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
      rating: { rate: 4.3, count: 95 }
    },
    {
      id: 6,
      title: "Gold Necklace",
      price: 299.99,
      description: "Elegant gold necklace with intricate design. Perfect accessory for formal events and special occasions.",
      category: "jewelery",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop",
      rating: { rate: 4.7, count: 67 }
    },
    {
      id: 7,
      title: "Men's Casual T-Shirt",
      price: 24.99,
      description: "Comfortable cotton t-shirt for men. Perfect for everyday wear and casual activities.",
      category: "men's clothing",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
      rating: { rate: 4.1, count: 234 }
    },
    {
      id: 8,
      title: "Women's Handbag",
      price: 89.99,
      description: "Stylish and practical handbag for women. Made with high-quality materials and elegant design.",
      category: "women's clothing",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop",
      rating: { rate: 4.4, count: 178 }
    }
  ];

  private readonly sampleCategories = ["electronics", "jewelery", "men's clothing", "women's clothing"];

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    await this.loadProducts();
    await this.loadCategories();
    this.loadFeaturedProduct();
  }

  // API Methods
  async loadProducts(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.showApiWarning.set(false);

      try {
        console.log('Attempting to fetch from API...');
        const response = await firstValueFrom(
          this.http.get<Product[]>(`${this.API_BASE_URL}/products`)
        );

        if (response && response.length > 0) {
          this.products.set(response);
          console.log('API data loaded successfully:', response.length, 'products');
        } else {
          throw new Error('No data received from API');
        }
      } catch (apiError) {
        console.warn('API request failed, using sample data:', apiError);
        this.products.set(this.sampleProducts);
        this.showApiWarning.set(true);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      this.products.set(this.sampleProducts);
      this.showApiWarning.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadCategories(): Promise<void> {
    try {
      try {
        const response = await firstValueFrom(
          this.http.get<string[]>(`${this.API_BASE_URL}/products/categories`)
        );

        if (response && response.length > 0) {
          this.categories.set(response);
        } else {
          throw new Error('No categories received from API');
        }
      } catch (apiError) {
        console.warn('Categories API request failed, using sample data:', apiError);
        this.categories.set(this.sampleCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categories.set(this.sampleCategories);
    }
  }

  loadFeaturedProduct(): void {
    try {
      const products = this.products();
      if (products.length > 0) {
        const randomIndex = Math.floor(Math.random() * products.length);
        this.featuredProduct.set(products[randomIndex]);
      }
    } catch (error) {
      console.error('Error loading featured product:', error);
    }
  }

  // UI Methods
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  onCategoryFilter(category: string): void {
    this.currentFilter.set(category);
  }

  addToCart(productId: number): void {
    const product = this.products().find(p => p.id === productId);
    if (!product) return;

    const currentCart = this.cart();
    const existingItem = currentCart.find(item => item.id === productId);

    if (existingItem) {
      const updatedCart = currentCart.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      this.cart.set(updatedCart);
    } else {
      const newItem: CartItem = { ...product, quantity: 1 };
      this.cart.set([...currentCart, newItem]);
    }
  }

  removeFromCart(productId: number): void {
    const updatedCart = this.cart().filter(item => item.id !== productId);
    this.cart.set(updatedCart);
  }

  updateCartItemQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const updatedCart = this.cart().map(item =>
      item.id === productId
        ? { ...item, quantity }
        : item
    );
    this.cart.set(updatedCart);
  }

  clearCart(): void {
    this.cart.set([]);
  }

  generateStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="bi bi-star-fill text-warning"></i>';
    }

    // Half star
    if (hasHalfStar) {
      stars += '<i class="bi bi-star-half text-warning"></i>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="bi bi-star text-warning"></i>';
    }

    return stars;
  }

  getDiscountedPrice(originalPrice: number): { discountPercent: number; originalPrice: number } {
    const discountPercent = Math.floor(Math.random() * 30) + 10;
    const discountedOriginalPrice = Number((originalPrice * (1 + discountPercent / 100)).toFixed(2));

    return { discountPercent, originalPrice: discountedOriginalPrice };
  }

  dismissApiWarning(): void {
    this.showApiWarning.set(false);
  }

  // Utility methods for template
  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  trackByCategoryName(index: number, category: string): string {
    return category;
  }

  checkout(): void {
    if (this.cart().length === 0) return;

    // Simple checkout simulation
    const total = this.cartTotal();
    const itemCount = this.cartCount();

    alert(`Checkout successful!\nTotal: ${total.toFixed(2)}\nItems: ${itemCount}`);

    // Clear the cart after successful checkout
    this.clearCart();

    // Close modal programmatically if needed
    // Note: In a real app, you'd handle this with proper routing/navigation
  }
}
