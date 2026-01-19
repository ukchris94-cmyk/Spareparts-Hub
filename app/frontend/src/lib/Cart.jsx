import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentsAPI } from '../lib/api';
import { formatPrice } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CreditCard } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('cart'); // cart, checkout
  const [deliveryInfo, setDeliveryInfo] = useState({
    delivery_address: user?.address || '',
    delivery_phone: user?.phone || '',
    notes: '',
  });

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setStep('checkout');
  };

  const handlePlaceOrder = async () => {
    if (!deliveryInfo.delivery_address || !deliveryInfo.delivery_phone) {
      toast.error('Please fill in delivery details');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          part_id: item.part.id,
          quantity: item.quantity,
        })),
        ...deliveryInfo,
      };

      const response = await ordersAPI.create(orderData);
      const order = response.data;

      // Initialize payment
      const paymentResponse = await paymentsAPI.initialize({
        order_id: order.id,
        email: user.email,
        amount: Math.round(total * 100), // Convert to kobo
      });

      if (paymentResponse.data.status) {
        clearCart();
        // For mock mode, redirect to orders page
        if (paymentResponse.data.data.authorization_url.startsWith('/')) {
          toast.success('Order placed successfully!');
          navigate(`/orders/${order.id}`);
        } else {
          // Redirect to Paystack
          window.location.href = paymentResponse.data.data.authorization_url;
        }
      } else {
        toast.error('Payment initialization failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step === 'cart') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingCart className= "h-16 w-16 mx-auto text-zinc-600 mb-4 " />
          <h2 className= "text-2xl font-bold mb-2 ">Your cart is empty</h2>
          <p className= "text-zinc-400 mb-8 ">Start browsing parts to add items to your cart</p>
          <Link to= "/parts ">
            <Button className= "bg-amber-500 text-black hover:bg-amber-400 font-bold ">
              Browse Parts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className= "container mx-auto px-4 py-8 ">
      {/* Header */}
      <div className= "flex items-center gap-4 mb-8 ">
        {step === 'checkout' && (
          <Button variant= "ghost " onClick={() => setStep('cart')}>
            <ArrowLeft className= "h-4 w-4 mr-2 " />
            Back to Cart
          </Button>
        )}
        <h1 className= "text-3xl font-black ">
          {step === 'cart' ? 'Shopping Cart' : 'Checkout'}
        </h1>
      </div>

      <div className= "grid lg:grid-cols-3 gap-8 ">
        {/* Cart Items / Checkout Form */}
        <div className= "lg:col-span-2 space-y-4 ">
          {step === 'cart' ? (
            items.map((item) => (
              <Card key={item.part.id} className= "bg-zinc-900/50 border-zinc-800 " data-testid={`cart-item-${item.part.id}`}>
                <CardContent className= "p-4 ">
                  <div className= "flex gap-4 ">
                    <div className= "w-20 h-20 bg-zinc-800 rounded-md flex items-center justify-center ">
                      {item.part.image_url ? (
                        <img src={item.part.image_url} alt={item.part.name} className= "w-full h-full object-cover rounded-md " />
                      ) : (
                        <ShoppingCart className= "h-8 w-8 text-zinc-600 " />
                      )}
                    </div>
                    <div className= "flex-1 ">
                      <h3 className= "font-bold ">{item.part.name}</h3>
                      <p className= "text-sm text-zinc-400 font-mono ">SKU: {item.part.sku}</p>
                      <p className= "text-sm text-zinc-400 ">{item.part.vendor_name}</p>
                    </div>
                    <div className= "text-right space-y-2 ">
                      <p className= "font-mono font-bold text-amber-500 ">{formatPrice(item.part.price * item.quantity)}</p>
                      <div className= "flex items-center gap-2 ">
                        <Button
                          variant= "outline "
                          size= "icon "
                          onClick={() => updateQuantity(item.part.id, item.quantity - 1)}
                          className= "h-8 w-8 border-zinc-700 "
                        >
                          <Minus className= "h-3 w-3 " />
                        </Button>
                        <span className= "w-8 text-center font-mono ">{item.quantity}</span>
                        <Button
                          variant= "outline "
                          size= "icon "
                          onClick={() => updateQuantity(item.part.id, item.quantity + 1)}
                          className= "h-8 w-8 border-zinc-700 "
                        >
                          <Plus className= "h-3 w-3 " />
                        </Button>
                        <Button
                          variant= "ghost "
                          size= "icon "
                          onClick={() => removeItem(item.part.id)}
                          className= "h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10 "
                        >
                          <Trash2 className= "h-4 w-4 " />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className= "bg-zinc-900/50 border-zinc-800 ">
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent className= "space-y-4 ">
                <div className= "space-y-2 ">
                  <Label className= "label-text ">Delivery Address</Label>
                  <Textarea
                    placeholder= "Enter your delivery address in Port Harcourt "
                    value={deliveryInfo.delivery_address}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, delivery_address: e.target.value })}
                    className= "bg-black/20 border-zinc-800 focus:border-amber-500 "
                    data-testid= "checkout-address "
                  />
                </div>
                <div className= "space-y-2 ">
                  <Label className= "label-text ">Phone Number</Label>
                  <Input
                    type= "tel "
                    placeholder= "+234... "
                    value={deliveryInfo.delivery_phone}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, delivery_phone: e.target.value })}
                    className= "bg-black/20 border-zinc-800 focus:border-amber-500 h-12 "
                    data-testid= "checkout-phone "
                  />
                </div>
                <div className= "space-y-2 ">
                  <Label className= "label-text ">Order Notes (Optional)</Label>
                  <Textarea
                    placeholder= "Any special instructions for the vendor or dispatcher "
                    value={deliveryInfo.notes}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, notes: e.target.value })}
                    className= "bg-black/20 border-zinc-800 focus:border-amber-500 "
                    data-testid= "checkout-notes "
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className= "bg-zinc-900/50 border-zinc-800 sticky top-20 ">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className= "space-y-4 ">
              {items.map((item) => (
                <div key={item.part.id} className= "flex justify-between text-sm ">
                  <span className= "text-zinc-400 ">
                    {item.part.name} x{item.quantity}
                  </span>
                  <span className= "font-mono ">{formatPrice(item.part.price * item.quantity)}</span>
                </div>
              ))}
              <Separator className= "bg-zinc-800 " />
              <div className= "flex justify-between text-lg font-bold ">
                <span>Total</span>
                <span className= "font-mono text-amber-500 ">{formatPrice(total)}</span>
              </div>
              {step === 'cart' ? (
                <Button
                  onClick={handleCheckout}
                  className= "w-full bg-amber-500 text-black hover:bg-amber-400 font-bold h-12 btn-press "
                  data-testid= "proceed-checkout "
                >
                  Proceed to Checkout
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className= "w-full bg-amber-500 text-black hover:bg-amber-400 font-bold h-12 btn-press "
                  data-testid= "place-order "
                >
                  <CreditCard className= "mr-2 h-4 w-4 " />
                  {loading ? 'Processing...' : 'Pay with Paystack'}
                </Button>
              )}
              <p className= "text-xs text-zinc-400 text-center ">
                Secure payment powered by Paystack
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
