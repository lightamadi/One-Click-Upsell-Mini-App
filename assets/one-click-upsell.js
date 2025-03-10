class OneClickUpsell {
    constructor() {
      this.popup = document.getElementById('one-click-upsell');
      this.addToCartForms = document.querySelectorAll('form[action="/cart/add"]');
      this.closeButton = this.popup?.querySelector('.upsell-popup__close');
      this.addUpsellButton = this.popup?.querySelector('.upsell-popup__add-to-cart');
      this.declineButton = this.popup?.querySelector('.upsell-popup__decline');
      this.overlay = this.popup?.querySelector('.upsell-popup__overlay');
      
      this.init();
    }
  
    init() {
      if (!this.popup) return;
      
      // Listen to all add to cart forms
      this.addToCartForms.forEach(form => {
        form.addEventListener('submit', this.handleAddToCart.bind(this));
      });
  
      // Close popup events
      this.closeButton?.addEventListener('click', this.hidePopup.bind(this));
      this.overlay?.addEventListener('click', this.hidePopup.bind(this));
      this.declineButton?.addEventListener('click', this.hidePopup.bind(this));
      
      // Add upsell product to cart
      this.addUpsellButton?.addEventListener('click', this.handleUpsellAdd.bind(this));
  
      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.hidePopup();
      });
    }
  
    async handleAddToCart(event) {
      event.preventDefault();
      const form = event.target;
      
      try {
        // Add the original product to cart
        const formData = new FormData(form);
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error('Failed to add item to cart');
        
        // Show the upsell popup
        this.showPopup();
        
      } catch (error) {
        console.error('Error adding item to cart:', error);
      }
    }
  
    async handleUpsellAdd() {
      const productContainer = this.popup.querySelector('.upsell-popup__product');
      const upsellVariantId = productContainer?.dataset.upsellVariantId;
      
      if (!upsellVariantId) {
        console.error('No upsell variant ID found');
        return;
      }
  
      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: [{
              id: upsellVariantId,
              quantity: 1
            }]
          })
        });
  
        if (!response.ok) throw new Error('Failed to add upsell item');
  
        // Update cart count and show success message
        this.updateCartCount();
        this.hidePopup();
        
      } catch (error) {
        console.error('Error adding upsell item:', error);
      }
    }
  
    async updateCartCount() {
      try {
        const response = await fetch('/cart.js');
        const cart = await response.json();
        
        // Update cart count in header if it exists
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          cartCount.textContent = cart.item_count;
        }
      } catch (error) {
        console.error('Error updating cart count:', error);
      }
    }
  
    showPopup() {
      this.popup.style.display = 'block';
      document.body.style.overflow = 'hidden';
      setTimeout(() => this.popup.classList.add('is-active'), 10);
    }
  
    hidePopup() {
      this.popup.classList.remove('is-active');
      document.body.style.overflow = '';
      setTimeout(() => {
        this.popup.style.display = 'none';
      }, 300);
    }
  }
  
  // Initialize the upsell popup when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new OneClickUpsell();
  }); 