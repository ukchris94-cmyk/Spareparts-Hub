import React, { useEffect, useState } from 'react';
import { ordersAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Package, Truck, MapPin, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function VendorOrders() {
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

  const handleConfirmOrder = async (orderId) => {
    try {
      await ordersAPI.updateStatus(orderId, 'confirmed');
      toast.success('Order confirmed');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to confirm order');
    }
  };

  return (
    <div className= "container mx-auto px-4 py-8 ">
      <div className= "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 ">
        <div>
          <h1 className= "text-3xl font-black ">Orders</h1>
          <p className= "text-zinc-400 ">Manage orders for your products</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className= "w-48 bg-zinc-900/50 border-zinc-800 ">
            <SelectValue placeholder= "All Statuses " />
          </SelectTrigger>
          <SelectContent className= "bg-zinc-900 border-zinc-800 ">
            <SelectItem value= " ">All Statuses</SelectItem>
            <SelectItem value= "pending ">Pending</SelectItem>
            <SelectItem value= "confirmed ">Confirmed</SelectItem>
            <SelectItem value= "paid ">Paid</SelectItem>
            <SelectItem value= "delivered ">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className= "text-zinc-400 ">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className= "text-center py-16 ">
          <Package className= "h-16 w-16 mx-auto text-zinc-600 mb-4 " />
          <h2 className= "text-xl font-bold mb-2 ">No orders yet</h2>
          <p className= "text-zinc-400 ">Orders for your products will appear here</p>
        </div>
      ) : (
        <div className= "space-y-4 ">
          {orders.map((order) => (
            <Card key={order.id} className= "bg-zinc-900/50 border-zinc-800 ">
              <CardContent className= "p-6 ">
                <div className= "flex flex-col md:flex-row md:items-center justify-between gap-4 ">
                  <div className= "space-y-2 ">
                    <div className= "flex items-center gap-3 ">
                      <span className= "font-mono text-amber-500 font-bold ">#{order.id.slice(0, 8)}</span>
                      <Badge className={`${ORDER_STATUS_COLORS[order.status]} border`}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className= "text-sm text-zinc-400 ">
                      From: {order.client_name} • {formatDate(order.created_at)}
                    </p>
                    <div className= "flex items-start gap-2 text-sm text-zinc-400 ">
                      <MapPin className= "h-4 w-4 mt-0.5 " />
                      <span>{order.delivery_address}</span>
                    </div>
                    <div className= "mt-2 ">
                      {order.items.filter(item => item.vendor_id === user?.id).map((item, idx) => (
                        <div key={idx} className= "text-sm ">
                          {item.quantity}x {item.part_name} - {formatPrice(item.total_price)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className= "flex flex-col items-end gap-2 ">
                    <p className= "font-mono font-bold text-xl ">{formatPrice(order.total_amount)}</p>
                    {order.status === 'pending' && (
                      <Button
                        onClick={() => handleConfirmOrder(order.id)}
                        className= "bg-amber-500 text-black hover:bg-amber-400 font-bold "
                      >
                        <CheckCircle className= "h-4 w-4 mr-2 " />
                        Confirm Order
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function Deliveries() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (orderId) => {
    try {
      await ordersAPI.assignDispatcher(orderId);
      toast.success('Delivery assigned to you');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to assign delivery');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      toast.success('Status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const myDeliveries = orders.filter((o) => o.dispatcher_id === user?.id);
  const availableOrders = orders.filter((o) => o.status === 'paid' && !o.dispatcher_id);

  return (
    <div className= "container mx-auto px-4 py-8 ">
      <div className= "mb-8 ">
        <h1 className= "text-3xl font-black ">Deliveries</h1>
        <p className= "text-zinc-400 ">Manage your delivery assignments</p>
      </div>

      {/* Available Deliveries */}
      <div className= "mb-8 ">
        <h2 className= "text-xl font-bold mb-4 flex items-center gap-2 ">
          <Package className= "h-5 w-5 text-green-500 " />
          Available for Pickup ({availableOrders.length})
        </h2>
        {availableOrders.length === 0 ? (
          <Card className= "bg-zinc-900/50 border-zinc-800 ">
            <CardContent className= "p-6 text-center text-zinc-400 ">
              No orders available for pickup
            </CardContent>
          </Card>
        ) : (
          <div className= "space-y-4 ">
            {availableOrders.map((order) => (
              <Card key={order.id} className= "bg-zinc-900/50 border-zinc-800 ">
                <CardContent className= "p-6 ">
                  <div className= "flex flex-col md:flex-row md:items-center justify-between gap-4 ">
                    <div>
                      <span className= "font-mono text-amber-500 font-bold ">#{order.id.slice(0, 8)}</span>
                      <p className= "text-sm text-zinc-400 mt-1 ">
                        {order.items.length} items • {formatDate(order.created_at)}
                      </p>
                      <div className= "flex items-start gap-2 text-sm text-zinc-400 mt-2 ">
                        <MapPin className= "h-4 w-4 mt-0.5 " />
                        <span>{order.delivery_address}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAssign(order.id)}
                      className= "bg-amber-500 text-black hover:bg-amber-400 font-bold "
                    >
                      <Truck className= "h-4 w-4 mr-2 " />
                      Accept Delivery
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My Deliveries */}
      <div>
        <h2 className= "text-xl font-bold mb-4 flex items-center gap-2 ">
          <Truck className= "h-5 w-5 text-amber-500 " />
          My Deliveries ({myDeliveries.length})
        </h2>
        {myDeliveries.length === 0 ? (
          <Card className= "bg-zinc-900/50 border-zinc-800 ">
            <CardContent className= "p-6 text-center text-zinc-400 ">
              No active deliveries. Accept an order above to start.
            </CardContent>
          </Card>
        ) : (
          <div className= "space-y-4 ">
            {myDeliveries.map((order) => (
              <Card key={order.id} className= "bg-zinc-900/50 border-zinc-800 ">
                <CardContent className= "p-6 ">
                  <div className= "flex flex-col md:flex-row md:items-center justify-between gap-4 ">
                    <div>
                      <div className= "flex items-center gap-3 ">
                        <span className= "font-mono text-amber-500 font-bold ">#{order.id.slice(0, 8)}</span>
                        <Badge className={`${ORDER_STATUS_COLORS[order.status]} border`}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className= "text-sm text-zinc-400 mt-1 ">
                        Client: {order.client_name} • {order.delivery_phone}
                      </p>
                      <div className= "flex items-start gap-2 text-sm text-zinc-400 mt-2 ">
                        <MapPin className= "h-4 w-4 mt-0.5 " />
                        <span>{order.delivery_address}</span>
                      </div>
                    </div>
                    <div className= "flex flex-wrap gap-2 ">
                      {order.status === 'assigned' && (
                        <Button
                          onClick={() => handleUpdateStatus(order.id, 'picked_up')}
                          variant= "outline "
                          className= "border-zinc-700 "
                        >
                          Mark Picked Up
                        </Button>
                      )}
                      {order.status === 'picked_up' && (
                        <Button
                          onClick={() => handleUpdateStatus(order.id, 'in_transit')}
                          className= "bg-blue-500 text-white hover:bg-blue-400 "
                        >
                          Start Delivery
                        </Button>
                      )}
                      {order.status === 'in_transit' && (
                        <Button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className= "bg-green-500 text-white hover:bg-green-400 "
                        >
                          <CheckCircle className= "h-4 w-4 mr-2 " />
                          Mark Delivered
                        </Button>
                      )}
                      <Link to={`/orders/${order.id}`}>
                        <Button variant= "outline " className= "border-zinc-700 ">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
