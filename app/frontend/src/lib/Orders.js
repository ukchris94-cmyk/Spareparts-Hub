"import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ordersAPI, paymentsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Package, MapPin, Phone, User, Truck, Clock, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react';

export function OrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const response = await ordersAPI.getAll(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"container mx-auto px-4 py-8\">
      <div className=\"flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8\">
        <div>
          <h1 className=\"text-3xl font-black\">My Orders</h1>
          <p className=\"text-zinc-400\">Track and manage your orders</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className=\"w-48 bg-zinc-900/50 border-zinc-800\">
            <SelectValue placeholder=\"All Statuses\" />
          </SelectTrigger>
          <SelectContent className=\"bg-zinc-900 border-zinc-800\">
            <SelectItem value=\"\">All Statuses</SelectItem>
            <SelectItem value=\"pending\">Pending</SelectItem>
            <SelectItem value=\"paid\">Paid</SelectItem>
            <SelectItem value=\"in_transit\">In Transit</SelectItem>
            <SelectItem value=\"delivered\">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className=\"space-y-4\">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className=\"bg-zinc-900/50 border-zinc-800 animate-pulse\">
              <CardContent className=\"p-6\">
                <div className=\"h-4 bg-zinc-800 rounded w-1/4 mb-4\" />
                <div className=\"h-4 bg-zinc-800 rounded w-1/2\" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className=\"text-center py-16\">
          <Package className=\"h-16 w-16 mx-auto text-zinc-600 mb-4\" />
          <h2 className=\"text-xl font-bold mb-2\">No orders found</h2>
          <p className=\"text-zinc-400 mb-8\">Start browsing parts to place your first order</p>
          <Link to=\"/parts\">
            <Button className=\"bg-amber-500 text-black hover:bg-amber-400 font-bold\">
              Browse Parts
            </Button>
          </Link>
        </div>
      ) : (
        <div className=\"space-y-4\">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className=\"bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors\" data-testid={`order-${order.id}`}>
                <CardContent className=\"p-6\">
                  <div className=\"flex flex-col md:flex-row md:items-center justify-between gap-4\">
                    <div>
                      <div className=\"flex items-center gap-3 mb-2\">
                        <span className=\"font-mono text-amber-500 font-bold\">#{order.id.slice(0, 8)}</span>
                        <Badge className={`${ORDER_STATUS_COLORS[order.status]} border`}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                        {order.payment_status === 'success' && (
                          <Badge className=\"bg-green-500/10 text-green-500 border border-green-500/20\">
                            <CreditCard className=\"h-3 w-3 mr-1\" />
                            Paid
                          </Badge>
                        )}
                      </div>
                      <p className=\"text-sm text-zinc-400\">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''} • {formatDate(order.created_at)}
                      </p>
                      {order.dispatcher_name && (
                        <p className=\"text-sm text-zinc-400 flex items-center gap-1 mt-1\">
                          <Truck className=\"h-3 w-3\" />
                          Dispatcher: {order.dispatcher_name}
                        </p>
                      )}
                    </div>
                    <div className=\"text-right\">
                      <p className=\"font-mono font-bold text-xl\">{formatPrice(order.total_amount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderDetail() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getOne(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      toast.success('Order status updated');
      fetchOrder();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAssignSelf = async () => {
    try {
      await ordersAPI.assignDispatcher(orderId);
      toast.success('Order assigned to you');
      fetchOrder();
    } catch (error) {
      toast.error('Failed to assign order');
    }
  };

  const handlePayNow = async () => {
    try {
      const response = await paymentsAPI.initialize({
        order_id: orderId,
        email: user.email,
        amount: Math.round(order.total_amount * 100),
      });
      if (response.data.status) {
        if (response.data.data.authorization_url.startsWith('/')) {
          // Mock payment - verify immediately
          await paymentsAPI.verify(response.data.data.reference);
          toast.success('Payment successful!');
          fetchOrder();
        } else {
          window.location.href = response.data.data.authorization_url;
        }
      }
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  if (loading) {
    return (
      <div className=\"container mx-auto px-4 py-8\">
        <p className=\"text-zinc-400\">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className=\"container mx-auto px-4 py-8\">
        <p className=\"text-zinc-400\">Order not found</p>
      </div>
    );
  }

  return (
    <div className=\"container mx-auto px-4 py-8\">
      <Link to=\"/orders\" className=\"inline-flex items-center text-zinc-400 hover:text-white mb-6\">
        <ArrowLeft className=\"h-4 w-4 mr-2\" />
        Back to Orders
      </Link>

      <div className=\"grid lg:grid-cols-3 gap-8\">
        {/* Order Details */}
        <div className=\"lg:col-span-2 space-y-6\">
          <Card className=\"bg-zinc-900/50 border-zinc-800\">
            <CardHeader>
              <div className=\"flex items-center justify-between\">
                <div>
                  <CardTitle className=\"flex items-center gap-3\">
                    Order #{order.id.slice(0, 8)}
                    <Badge className={`${ORDER_STATUS_COLORS[order.status]} border`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                  <p className=\"text-sm text-zinc-400 mt-1\">{formatDate(order.created_at)}</p>
                </div>
                {order.payment_status === 'success' && (
                  <Badge className=\"bg-green-500/10 text-green-500 border border-green-500/20\">
                    <CheckCircle className=\"h-4 w-4 mr-1\" />
                    Paid
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className=\"space-y-6\">
              {/* Items */}
              <div>
                <h3 className=\"label-text mb-3\">Items</h3>
                <div className=\"space-y-3\">
                  {order.items.map((item, idx) => (
                    <div key={idx} className=\"flex justify-between items-start p-3 bg-zinc-800/50 rounded-md\">
                      <div>
                        <p className=\"font-bold\">{item.part_name}</p>
                        <p className=\"text-xs text-zinc-400 font-mono\">SKU: {item.part_sku}</p>
                        <p className=\"text-xs text-zinc-400\">{item.vendor_name}</p>
                      </div>
                      <div className=\"text-right\">
                        <p className=\"font-mono\">{item.quantity} x {formatPrice(item.unit_price)}</p>
                        <p className=\"font-mono font-bold text-amber-500\">{formatPrice(item.total_price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className=\"bg-zinc-800\" />

              {/* Delivery Info */}
              <div>
                <h3 className=\"label-text mb-3\">Delivery Details</h3>
                <div className=\"space-y-2 text-sm\">
                  <div className=\"flex items-start gap-2\">
                    <MapPin className=\"h-4 w-4 text-zinc-400 mt-0.5\" />
                    <span>{order.delivery_address}</span>
                  </div>
                  <div className=\"flex items-center gap-2\">
                    <Phone className=\"h-4 w-4 text-zinc-400\" />
                    <span>{order.delivery_phone}</span>
                  </div>
                  {order.notes && (
                    <div className=\"mt-3 p-3 bg-zinc-800/50 rounded-md\">
                      <p className=\"text-xs text-zinc-400 mb-1\">Notes</p>
                      <p>{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {order.dispatcher_name && (
                <>
                  <Separator className=\"bg-zinc-800\" />
                  <div>
                    <h3 className=\"label-text mb-3\">Dispatcher</h3>
                    <div className=\"flex items-center gap-3 p-3 bg-zinc-800/50 rounded-md\">
                      <div className=\"w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center\">
                        <Truck className=\"h-5 w-5 text-amber-500\" />
                      </div>
                      <div>
                        <p className=\"font-bold\">{order.dispatcher_name}</p>
                        <p className=\"text-xs text-zinc-400\">Assigned dispatcher</p>
                      </div>
                      {(order.status === 'assigned' || order.status === 'in_transit') && (
                        <Link to={`/track?order=${order.id}`} className=\"ml-auto\">
                          <Button variant=\"outline\" size=\"sm\" className=\"border-zinc-700\">
                            <MapPin className=\"h-4 w-4 mr-1\" />
                            Track
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary & Actions */}
        <div>
          <Card className=\"bg-zinc-900/50 border-zinc-800 sticky top-20\">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className=\"space-y-4\">
              <div className=\"flex justify-between\">
                <span className=\"text-zinc-400\">Subtotal</span>
                <span className=\"font-mono\">{formatPrice(order.total_amount)}</span>
              </div>
              <div className=\"flex justify-between\">
                <span className=\"text-zinc-400\">Delivery</span>
                <span className=\"font-mono\">Free</span>
              </div>
              <Separator className=\"bg-zinc-800\" />
              <div className=\"flex justify-between text-lg font-bold\">
                <span>Total</span>
                <span className=\"font-mono text-amber-500\">{formatPrice(order.total_amount)}</span>
              </div>

              {/* Actions based on role */}
              {user.role === 'client' && order.payment_status !== 'success' && order.status !== 'cancelled' && (
                <Button
                  onClick={handlePayNow}
                  className=\"w-full bg-amber-500 text-black hover:bg-amber-400 font-bold btn-press\"
                >
                  <CreditCard className=\"mr-2 h-4 w-4\" />
                  Pay Now
                </Button>
              )}

              {user.role === 'vendor' && order.status === 'pending' && (
                <Button
                  onClick={() => handleUpdateStatus('confirmed')}
                  className=\"w-full bg-amber-500 text-black hover:bg-amber-400 font-bold\"
                >
                  Confirm Order
                </Button>
              )}

              {user.role === 'dispatcher' && order.status === 'paid' && !order.dispatcher_id && (
                <Button
                  onClick={handleAssignSelf}
                  className=\"w-full bg-amber-500 text-black hover:bg-amber-400 font-bold\"
                >
                  Accept Delivery
                </Button>
              )}

              {user.role === 'dispatcher' && order.dispatcher_id === user.id && (
                <div className=\"space-y-2\">
                  {order.status === 'assigned' && (
                    <Button
                      onClick={() => handleUpdateStatus('picked_up')}
                      className=\"w-full bg-blue-500 text-white hover:bg-blue-400 font-bold\"
                    >
                      Mark as Picked Up
                    </Button>
                  )}
                  {order.status === 'picked_up' && (
                    <Button
                      onClick={() => handleUpdateStatus('in_transit')}
                      className=\"w-full bg-cyan-500 text-white hover:bg-cyan-400 font-bold\"
                    >
                      Start Delivery
                    </Button>
                  )}
                  {order.status === 'in_transit' && (
                    <Button
                      onClick={() => handleUpdateStatus('delivered')}
                      className=\"w-full bg-green-500 text-white hover:bg-green-400 font-bold\"
                    >
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
