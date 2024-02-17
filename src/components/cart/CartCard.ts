import { CartItem } from '../../models/cartItem';
import { ProductGroup } from '../../models/productGroup';
import { Cart } from '../../utils/core/cartManager';
import { Catalog } from '../../utils/core/catalogManager';

const TPL_CartCard = document.createElement('template');

const TPL_CartCard_css = /* CSS */ `
<style>
    :host {
        overflow: hidden;
        border-radius: 4px;
    }
    #count {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 1rem;
      height: 1rem;

      padding: 0.1rem;
      margin: 0;
    }

    #btn-remove {
      margin-left: auto;
    }

    .container {
        position: relative;
        height: 6rem;
        padding: 1.2rem;
    }

    .container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.4;
        background: var(--color-surface-400);
    }

    .cart-card-image-container {
        width: 4rem;
        height: 4rem;
        background: var(--color-tertiary-500);
        opacity: 0.5;
        margin-block: auto;
    }

    h1, h2, h3, h4, h5, h6, p {
        margin: 0;
        padding: 0;
    }

    .grid-container {
        display: grid;
        grid-template-columns: auto auto auto;
        gap: 1rem;
        align-items: center;
        justify-content: space-between;
    }

    .grid-item {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: start;

      height: 100%;
    }

    .button-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
</style>
`;

TPL_CartCard.innerHTML = /* HTML */ `
  ${TPL_CartCard_css}

  <div class="container grid-container">
    <div class="grid-item">
      <div class="cart-card-image-container"></div>
    </div>
    <div class="grid-item">
      <h4 id="title">Cart Item</h4>
      <p id="description">Lorem Ipsum</p>
      <p id="price">$0.00</p>
    </div>
    <div class="grid-item">
      <app-button
        iconType="solid"
        iconName="trash"
        size="sm"
        id="btn-remove"></app-button>
      <div class="button-group">
        <app-button
          iconName="minus"
          size="sm"
          id="btn-decrement"></app-button>
        <p><span id="count">1</span></p>
        <app-button
          iconName="plus"
          size="sm"
          id="btn-increment"></app-button>
      </div>
    </div>
  </div>
`;

class CartCard extends HTMLElement {
  private _cartItem: CartItem;
  private _titleLabel: HTMLElement;
  private _descriptionLabel: HTMLElement;
  private _priceLabel: HTMLElement;
  private _countLabel: HTMLElement;
  private _removeButton: HTMLElement;
  private _addButton: HTMLElement;
  private _subtractButton: HTMLElement;
  private _totalCost: Number;

  constructor(cartItem: CartItem) {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const clone = TPL_CartCard.content.cloneNode(true);
    shadow.append(clone);

    this._titleLabel = shadow.querySelector('#title')!;
    this._descriptionLabel = shadow.querySelector('#description')!;
    this._priceLabel = shadow.querySelector('#price')!;
    this._countLabel = shadow.querySelector('#count')!;
    this._removeButton = shadow.querySelector('#btn-remove')!;
    this._addButton = shadow.querySelector('#btn-increment')!;
    this._subtractButton = shadow.querySelector('#btn-decrement')!;
    this._cartItem = cartItem;

    if (cartItem.variantName) {
      this._titleLabel.innerText = cartItem.variantName;
    } else this._titleLabel.innerText = cartItem.groupName;

    this._descriptionLabel.innerText = cartItem.groupDescription;
    this._totalCost = cartItem.groupPrice;
    this._priceLabel.innerText = String(this._totalCost);
    this.count = String(cartItem.count);
  }

  static get observedAttributes() {
    return ['count', 'totalCost'];
  }

  attributeChangedCallback(attName: String, oldVal: any, newVal: any) {
    if (oldVal === newVal) return;

    switch (attName) {
      case 'count':
        this._countLabel.innerText = String(newVal);
        this._priceLabel.innerText = String(this.totalCost);
        break;
    }
  }

  get count(): string | null {
    return this.getAttribute('count');
  }

  set count(value: string) {
    this.setAttribute('count', value);
    this.cartItem!.count = Number(value);
  }

  get cartItem(): CartItem | null {
    return this._cartItem;
  }

  set cartItem(value: CartItem) {
    this._cartItem = value;
    this.updateItemLabels();
  }

  get totalCost(): Number {
    return Number(this._totalCost) * Number(this.count);
  }

  set totalCost(value: number) {
    this._totalCost = value;
    this.setAttribute('totalCost', String(value));
  }

  connectedCallback() {
    this._removeButton.addEventListener('click', () => this.removeItem());
    this._addButton.addEventListener('click', () => this.incrementCount());
    this._subtractButton.addEventListener('click', () => this.decrementCount());
  }

  updateItemLabels() {
    this._titleLabel.innerText = this._cartItem.groupName!;
    this._descriptionLabel.innerText = this._cartItem.groupDescription!;
    this._priceLabel.innerText = String(this._cartItem.groupPrice)!;
  }

  removeItem() {
    Cart.removeItem(
      Catalog.getGroup(this._cartItem.groupId),
      Catalog.getVariant(this._cartItem.groupId, this._cartItem.variantId)
    );
    this.remove();
  }

  incrementCount() {
    this.cartItem!.count++;
    this.count = String(this.cartItem!.count);
  }

  decrementCount() {
    this.cartItem!.count--;

    if (this.cartItem!.count >= 1) {
      this.count = String(this.cartItem!.count);
    } else {
      this.removeItem();
    }
  }

  disconnectedCallback() {
    this._removeButton.removeEventListener('click', () => this.removeItem());
  }

  updateTotalCost() {}
}

window.customElements.define('cart-card', CartCard);

export default CartCard;
