import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, partsAPI, adminAPI, locationAPI } from '../lib/api';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Package,
  ShoppingCart,
  Truck,
  Users,
  DollarSign,
  Clock,
  ArrowRight,
  MapPin,
  Box,
} from 'lucide-react';

function ClientDashboard() {
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

  const recentOrders = orders.slice(0, 5);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
  const inTransitOrders = orders.filter(o => o.status === 'in_transit' || o.status === 'assigned');

  return (
    <div className= "space-y-6 " data-testid= "client-dashboard ">
      {/* Stats */}
      <div className= "grid grid-cols-2 lg:grid-cols-4 gap-4 ">
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">Total Orders</p>
                <p className= "text-2xl font-black font-mono mt-1 ">{orders.length}</p>
              </div>
              <Package className= "h-8 w-8 text-amber-500 " />
            </div>
          </CardContent>
        </Card>
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">Pending</p>
                <p className= "text-2xl font-black font-mono mt-1 ">{pendingOrders.length}</p>
              </div>
              <Clock className= "h-8 w-8 text-yellow-500 " />
            </div>
          </CardContent>
        </Card>
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">In Transit</p>
                <p className= "text-2xl font-black font-mono mt-1 ">{inTransitOrders.length}</p>
              </div>
              <Truck className= "h-8 w-8 text-blue-500 " />
            </div>
          </CardContent>
        </Card>
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">Total Spent</p>
                <p className= "text-xl font-black font-mono mt-1 ">
                  {formatPrice(orders.reduce((sum, o) => sum + o.total_amount, 0))}
                </p>
              </div>
              <DollarSign className= "h-8 w-8 text-green-500 " />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className= "grid md:grid-cols-2 gap-4 ">
        <Link to= "/parts ">
          <Card className= "bg-zinc-900/50 border-zinc-800 hover:border-amber-500/50 transition-colors cursor-pointer ">
            <CardContent className= "p-6 flex items-center justify-between ">
              <div className= "flex items-center gap-4 ">
                <div className= "p-3 bg-amber-500/10 rounded-md ">
                  <Box className= "h-6 w-6 text-amber-500 " />
                </div>
                <div>
                  <h3 className= "font-bold ">Browse Parts</h3>
                  <p className= "text-sm text-zinc-400 ">Find and order spare parts</p>
                </div>
              </div>
              <ArrowRight className= "h-5 w-5 text-zinc-400 " />
            </CardContent>
          </Card>
        </Link>
        <Link to= "/track ">
          <Card className= "bg-zinc-900/50 border-zinc-800 hover:border-blue-500/50 transition-colors cursor-pointer ">
            <CardContent className= "p-6 flex items-center justify-between ">
              <div className= "flex items-center gap-4 ">
                <div className= "p-3 bg-blue-500/10 rounded-md ">
                  <MapPin className= "h-6 w-6 text-blue-500 " />
                </div>
                <div>
                  <h3 className= "font-bold ">Track Delivery</h3>
                  <p className= "text-sm text-zinc-400 ">See your dispatcher location</p>
                </div>
              </div>
              <ArrowRight className= "h-5 w-5 text-zinc-400 " />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card className= "bg-zinc-900/50 border-zinc-800 ">
        <CardHeader className= "flex flex-row items-center justify-between ">
          <CardTitle>Recent Orders</CardTitle>
          <Link to= "/orders ">
            <Button variant= "ghost " size= "sm ">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className= "text-zinc-400 ">Loading...</p>
          ) : recentOrders.length === 0 ? (
            <p className= "text-zinc-400 ">No orders yet. Start browsing parts!</p>
          ) : (
            <div className= "space-y-3 ">
              {recentOrders.map((order) => (
                <Link key={order.id} to={`/orders/${order.id}`}>
                  <div className= "flex items-center justify-between p-3 bg-zinc-800/50 rounded-md hover:bg-zinc-800 transition-colors ">
                    <div>
                      <p className= "font-mono text-sm text-amber-500 ">#{order.id.slice(0, 8)}</p>
                      <p className= "text-sm text-zinc-400 ">{order.items.length} items</p>
                    </div>
                    <div className= "text-right ">
                      <p className= "font-mono font-bold ">{formatPrice(order.total_amount)}</p>
                      <Badge className={`${ORDER_STATUS_COLORS[order.status]} text-xs`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function VendorDashboard() {
  const [orders, setOrders] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, partsRes] = await Promise.all([
        ordersAPI.getAll(),
        partsAPI.getAll({ vendor_id: user?.id }),
      ]);
      setOrders(ordersRes.data);
      setParts(partsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
  const lowStockParts = parts.filter(p => p.quantity < 5);

  return (
    <div className= "space-y-6 " data-testid= "vendor-dashboard ">
      {/* Stats */}
      <div className= "grid grid-cols-2 lg:grid-cols-4 gap-4 ">
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">Total Parts</p>
                <p className= "text-2xl font-black font-mono mt-1 ">{parts.length}</p>
              </div>
              <Box className= "h-8 w-8 text-amber-500 " />
            </div>
          </CardContent>
        </Card>
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">Pending Orders</p>
                <p className= "text-2xl font-black font-mono mt-1 ">{pendingOrders.length}</p>
              </div>
              <Clock className= "h-8 w-8 text-yellow-500 " />
            </div>
          </CardContent>
        </Card>
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">Low Stock</p>
                <p className= "text-2xl font-black font-mono mt-1 ">{lowStockParts.length}</p>
              </div>
              <Package className= "h-8 w-8 text-red-500 " />
            </div>
          </CardContent>
        </Card>
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">Total Revenue</p>
                <p className= "text-xl font-black font-mono mt-1 ">
                  {formatPrice(orders.reduce((sum, o) => sum + o.total_amount, 0))}
                </p>
              </div>
              <DollarSign className= "h-8 w-8 text-green-500 " />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className= "grid md:grid-cols-2 gap-4 ">
        <Link to= "/inventory ">
          <Card className= "bg-zinc-900/50 border-zinc-800 hover:border-amber-500/50 transition-colors cursor-pointer ">
            <CardContent className= "p-6 flex items-center justify-between ">
              <div className= "flex items-center gap-4 ">
                <div className= "p-3 bg-amber-500/10 rounded-md ">
                  <Box className= "h-6 w-6 text-amber-500 " />
                </div>
                <div>
                  <h3 className= "font-bold ">Manage Inventory</h3>
                  <p className= "text-sm text-zinc-400 ">Add or update parts</p>
                </div>
              </div>
              <ArrowRight className= "h-5 w-5 text-zinc-400 " />
            </CardContent>
          </Card>
        </Link>
        <Link to= "/vendor-orders ">
          <Card className= "bg-zinc-900/50 border-zinc-800 hover:border-blue-500/50 transition-colors cursor-pointer ">
            <CardContent className= "p-6 flex items-center justify-between ">
              <div className= "flex items-center gap-4 ">
                <div className= "p-3 bg-blue-500/10 rounded-md ">
                  <Package className= "h-6 w-6 text-blue-500 " />
                </div>
                <div>
                  <h3 className= "font-bold ">View Orders</h3>
                  <p className= "text-sm text-zinc-400 ">Manage customer orders</p>
                </div>
              </div>
              <ArrowRight className= "h-5 w-5 text-zinc-400 " />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function DispatcherDashboard() {
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

  const myDeliveries = orders.filter(o => o.dispatcher_id);
  const availableOrders = orders.filter(o => o.status === 'paid' && !o.dispatcher_id);

  return (
    <div className= "space-y-6 " data-testid= "dispatcher-dashboard ">
      {/* Stats */}
      <div className= "grid grid-cols-2 lg:grid-cols-4 gap-4 ">
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">My Deliveries</p>
                <p className= "text-2xl font-black font-mono mt-1 ">{myDeliveries.length}</p>
              </div>
              <Truck className= "h-8 w-8 text-amber-500 " />
            </div>
          </CardContent>
        </Card>
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">Available</p>
                <p className= "text-2xl font-black font-mono mt-1 ">{availableOrders.length}</p>
              </div>
              <Package className= "h-8 w-8 text-green-500 " />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className= "grid md:grid-cols-2 gap-4 ">
        <Link to= "/deliveries ">
          <Card className= "bg-zinc-900/50 border-zinc-800 hover:border-amber-500/50 transition-colors cursor-pointer ">
            <CardContent className= "p-6 flex items-center justify-between ">
              <div className= "flex items-center gap-4 ">
                <div className= "p-3 bg-amber-500/10 rounded-md ">
                  <Truck className= "h-6 w-6 text-amber-500 " />
                </div>
                <div>
                  <h3 className= "font-bold ">My Deliveries</h3>
                  <p className= "text-sm text-zinc-400 ">View assigned deliveries</p>
                </div>
              </div>
              <ArrowRight className= "h-5 w-5 text-zinc-400 " />
            </CardContent>
          </Card>
        </Link>
        <Link to= "/map ">
          <Card className= "bg-zinc-900/50 border-zinc-800 hover:border-blue-500/50 transition-colors cursor-pointer ">
            <CardContent className= "p-6 flex items-center justify-between ">
              <div className= "flex items-center gap-4 ">
                <div className= "p-3 bg-blue-500/10 rounded-md ">
                  <MapPin className= "h-6 w-6 text-blue-500 " />
                </div>
                <div>
                  <h3 className= "font-bold ">Live Map</h3>
                  <p className= "text-sm text-zinc-400 ">Update your location</p>
                </div>
              </div>
              <ArrowRight className= "h-5 w-5 text-zinc-400 " />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <p className= "text-zinc-400 ">Loading...</p>;
  }

  return (
    <div className= "space-y-6 " data-testid= "admin-dashboard ">
      {/* Stats */}
      <div className= "grid grid-cols-2 lg:grid-cols-4 gap-4 ">
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">Total Users</p>
                <p className= "text-2xl font-black font-mono mt-1 ">{stats.total_users}</p>
              </div>
              <Users className= "h-8 w-8 text-amber-500 " />
            </div>
          </CardContent>
        </Card>
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">Total Orders</p>
                <p className= "text-2xl font-black font-mono mt-1 ">{stats.total_orders}</p>
              </div>
              <Package className= "h-8 w-8 text-blue-500 " />
            </div>
          </CardContent>
        </Card>
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">Total Parts</p>
                <p className= "text-2xl font-black font-mono mt-1 ">{stats.total_parts}</p>
              </div>
              <Box className= "h-8 w-8 text-green-500 " />
            </div>
          </CardContent>
        </Card>
        <Card className= "bg-zinc-900/50 border-zinc-800 ">
          <CardContent className= "p-4 ">
            <div className= "flex items-center justify-between ">
              <div>
                <p className= "label-text ">Pending Orders</p>
                <p className= "text-2xl font-black font-mono mt-1 ">{stats.pending_orders}</p>
              </div>
              <Clock className= "h-8 w-8 text-yellow-500 " />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Breakdown */}
      <Card className= "bg-zinc-900/50 border-zinc-800 ">
        <CardHeader>
          <CardTitle>Users by Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className= "grid grid-cols-2 md:grid-cols-4 gap-4 ">
            {Object.entries(stats.users_by_role).map(([role, count]) => (
              <div key={role} className= "p-4 bg-zinc-800/50 rounded-md ">
                <p className= "label-text capitalize ">{role}s</p>
                <p className= "text-2xl font-black font-mono mt-1 ">{count}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className= "grid md:grid-cols-2 gap-4 ">
        <Link to= "/admin/users ">
          <Card className= "bg-zinc-900/50 border-zinc-800 hover:border-amber-500/50 transition-colors cursor-pointer ">
            <CardContent className= "p-6 flex items-center justify-between ">
              <div className= "flex items-center gap-4 ">
                <div className= "p-3 bg-amber-500/10 rounded-md ">
                  <Users className= "h-6 w-6 text-amber-500 " />
                </div>
                <div>
                  <h3 className= "font-bold ">Manage Users</h3>
                  <p className= "text-sm text-zinc-400 ">View and manage all users</p>
                </div>
              </div>
              <ArrowRight className= "h-5 w-5 text-zinc-400 " />
            </CardContent>
          </Card>
        </Link>
        <Link to= "/admin/orders ">
          <Card className= "bg-zinc-900/50 border-zinc-800 hover:border-blue-500/50 transition-colors cursor-pointer ">
            <CardContent className= "p-6 flex items-center justify-between ">
              <div className= "flex items-center gap-4 ">
                <div className= "p-3 bg-blue-500/10 rounded-md ">
                  <Package className= "h-6 w-6 text-blue-500 " />
                </div>
                <div>
                  <h3 className= "font-bold ">All Orders</h3>
                  <p className= "text-sm text-zinc-400 ">View all system orders</p>
                </div>
              </div>
              <ArrowRight className= "h-5 w-5 text-zinc-400 " />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const getDashboardComponent = () => {
    switch (user?.role) {
      case 'vendor':
        return <VendorDashboard />;
      case 'dispatcher':
        return <DispatcherDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <ClientDashboard />;
    }
  };

  return (
    <div className= "container mx-auto px-4 py-8 ">
      <div className= "mb-8 ">
        <h1 className= "text-3xl font-black ">Welcome back, {user?.full_name}!</h1>
        <p className= "text-zinc-400 capitalize ">{user?.role} Dashboard</p>
      </div>
      {getDashboardComponent()}
    </div>
  );
}
