"import React, { useEffect, useState } from 'react';
import { adminAPI, ordersAPI } from '../lib/api';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { Users, Search, UserCheck, UserX, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.toggleUserStatus(userId, !currentStatus);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors = {
    client: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    vendor: 'bg-green-500/10 text-green-500 border-green-500/20',
    dispatcher: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    admin: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };

  return (
    <div className=\"container mx-auto px-4 py-8\">
      <div className=\"mb-8\">
        <h1 className=\"text-3xl font-black\">Users Management</h1>
        <p className=\"text-zinc-400\">View and manage all platform users</p>
      </div>

      {/* Filters */}
      <div className=\"flex flex-col md:flex-row gap-4 mb-6\">
        <div className=\"relative flex-1\">
          <Search className=\"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400\" />
          <Input
            placeholder=\"Search by name or email...\"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className=\"pl-10 bg-zinc-900/50 border-zinc-800 focus:border-amber-500 h-12\"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className=\"w-48 bg-zinc-900/50 border-zinc-800 h-12\">
            <SelectValue placeholder=\"All Roles\" />
          </SelectTrigger>
          <SelectContent className=\"bg-zinc-900 border-zinc-800\">
            <SelectItem value=\"\">All Roles</SelectItem>
            <SelectItem value=\"client\">Clients</SelectItem>
            <SelectItem value=\"vendor\">Vendors</SelectItem>
            <SelectItem value=\"dispatcher\">Dispatchers</SelectItem>
            <SelectItem value=\"admin\">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className=\"bg-zinc-900/50 border-zinc-800\">
        <CardContent className=\"p-0\">
          {loading ? (
            <div className=\"p-8 text-center text-zinc-400\">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className=\"border-zinc-800 hover:bg-transparent\">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className=\"text-right\">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className=\"border-zinc-800\">
                    <TableCell>
                      <div>
                        <p className=\"font-bold\">{user.full_name}</p>
                        <p className=\"text-sm text-zinc-400\">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${roleColors[user.role]} border capitalize`}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className=\"text-zinc-400\">{user.phone}</TableCell>
                    <TableCell className=\"text-zinc-400\">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={user.is_active ? 'status-online' : 'status-offline'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className=\"text-right\">
                      <Button
                        variant=\"ghost\"
                        size=\"sm\"
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={user.is_active ? 'text-red-500 hover:text-red-400' : 'text-green-500 hover:text-green-400'}
                      >
                        {user.is_active ? (
                          <>
                            <UserX className=\"h-4 w-4 mr-1\" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className=\"h-4 w-4 mr-1\" />
                            Activate
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminOrders() {
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
          <h1 className=\"text-3xl font-black\">All Orders</h1>
          <p className=\"text-zinc-400\">View and manage all platform orders</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className=\"w-48 bg-zinc-900/50 border-zinc-800\">
            <SelectValue placeholder=\"All Statuses\" />
          </SelectTrigger>
          <SelectContent className=\"bg-zinc-900 border-zinc-800\">
            <SelectItem value=\"\">All Statuses</SelectItem>
            <SelectItem value=\"pending\">Pending</SelectItem>
            <SelectItem value=\"confirmed\">Confirmed</SelectItem>
            <SelectItem value=\"paid\">Paid</SelectItem>
            <SelectItem value=\"assigned\">Assigned</SelectItem>
            <SelectItem value=\"in_transit\">In Transit</SelectItem>
            <SelectItem value=\"delivered\">Delivered</SelectItem>
            <SelectItem value=\"cancelled\">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className=\"text-zinc-400\">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className=\"text-center py-16\">
          <Package className=\"h-16 w-16 mx-auto text-zinc-600 mb-4\" />
          <h2 className=\"text-xl font-bold mb-2\">No orders found</h2>
        </div>
      ) : (
        <Card className=\"bg-zinc-900/50 border-zinc-800\">
          <CardContent className=\"p-0\">
            <Table>
              <TableHeader>
                <TableRow className=\"border-zinc-800 hover:bg-transparent\">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dispatcher</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className=\"text-right\">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className=\"border-zinc-800\">
                    <TableCell>
                      <span className=\"font-mono text-amber-500\">#{order.id.slice(0, 8)}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className=\"font-bold\">{order.client_name}</p>
                        <p className=\"text-xs text-zinc-400\">{order.delivery_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell className=\"font-mono font-bold\">
                      {formatPrice(order.total_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${ORDER_STATUS_COLORS[order.status]} border`}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className=\"text-zinc-400\">
                      {order.dispatcher_name || '-'}
                    </TableCell>
                    <TableCell className=\"text-zinc-400\">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className=\"text-right\">
                      <Link to={`/orders/${order.id}`}>
                        <Button variant=\"ghost\" size=\"sm\">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
