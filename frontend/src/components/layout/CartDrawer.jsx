import { useCart } from "../../context/CartContext";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import "./CartDrawer.css";

function CartDrawer({ isOpen, onClose }) {
  const { cart, updateQuantity, removeFromCart, totalAmount } = useCart();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>My Cart</h2>

      {cart.length === 0 && <p>Your cart is empty</p>}

      {cart.length > 0 && (
        <div className="cart-drawer-list">
          {cart.map((item) => (
            <div key={item.id} className="cart-drawer-row">
              <span className="cart-drawer-name">{item.name}</span>

              <div className="cart-drawer-qty">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.id, item.quantity - 1)
                  }
                >
                  −
                </button>

                <span>{item.quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.id, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>

              <span className="cart-drawer-price">
                ₹{(Number(item.price) * item.quantity).toFixed(2)}
              </span>

              <button
                type="button"
                className="cart-drawer-remove"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="cart-drawer-total">
        <strong>Total: ₹{totalAmount.toFixed(2)}</strong>
      </div>

      <Button disabled={cart.length === 0}>
        Proceed to Checkout
      </Button>
    </Modal>
  );
}

export default CartDrawer;