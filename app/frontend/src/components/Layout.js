import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { notificationsAPI } from '../lib/api';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import {
  Package,
  ShoppingCart,
  Bell,
  User,
  LogOut,
  Menu,
  Home,
  Truck,
  Users,
  LayoutDashboard,
  Box,
  MapPin,
  Settings,
} from 'lucide-react';

const roleNavItems = {
  client: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/parts', label: 'Browse Parts', icon: Box },
    { to: '/orders', label: 'My Orders', icon: Package },
    { to: '/track', label: 'Track Delivery', icon: MapPin },
  ],
  vendor: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inventory', label: 'Inventory', icon: Box },
    { to: '/vendor-orders', label: 'Orders', icon: Package },
  ],
  dispatcher: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/deliveries', label: 'Deliveries', icon: Truck },
    { to: '/map', label: 'Live Map', icon: MapPin },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/orders', label: 'All Orders', icon: Package },
    { to: '/parts', label: 'Parts', icon: Box },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll();
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = user ? roleNavItems[user.role] || [] : [];

  return (
    <div className=\"min-h-screen bg-[#09090B]\">
      {/* Header */}
      <header className=\"sticky top-0 z-50 border-b border-zinc-800 bg-[#09090B]/95 backdrop-blur-sm\">
        <div className=\"container mx-auto flex h-16 items-center justify-between px-4\">
          {/* Logo & Mobile Menu */}
          <div className=\"flex items-center gap-4\">
            {user && (
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild className=\"md:hidden\">
                  <Button variant=\"ghost\" size=\"icon\">
                    <Menu className=\"h-5 w-5\" />
                  </Button>
                </SheetTrigger>
                <SheetContent side=\"left\" className=\"w-64 bg-zinc-900 border-zinc-800 p-0\">
                  <div className=\"p-4 border-b border-zinc-800\">
                    <Link to=\"/\" className=\"flex items-center gap-2\" onClick={() => setMobileOpen(false)}>
                      <Package className=\"h-6 w-6 text-amber-500\" />
                      <span className=\"font-bold text-lg\">SpareParts Hub</span>
                    </Link>
                  </div>
                  <ScrollArea className=\"h-[calc(100vh-5rem)]\">
                    <nav className=\"p-4 space-y-2\">
                      {navItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors ${
                            location.pathname === item.to
                              ? 'bg-amber-500 text-black font-bold'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                          }`}
                        >
                          <item.icon className=\"h-5 w-5\" />
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            )}
            <Link to=\"/\" className=\"flex items-center gap-2\">
              <Package className=\"h-6 w-6 text-amber-500\" />
              <span className=\"font-bold text-lg hidden sm:block\">SpareParts Hub</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          {user && (
            <nav className=\"hidden md:flex items-center gap-1\">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-sm transition-colors ${
                    location.pathname === item.to
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <item.icon className=\"h-4 w-4\" />
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Actions */}
          <div className=\"flex items-center gap-2\">
            {user ? (
              <>
                {/* Cart (Client only) */}
                {user.role === 'client' && (
                  <Link to=\"/cart\">
                    <Button variant=\"ghost\" size=\"icon\" className=\"relative\" data-testid=\"cart-button\">
                      <ShoppingCart className=\"h-5 w-5\" />
                      {itemCount > 0 && (
                        <Badge className=\"absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-black text-xs\">
                          {itemCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant=\"ghost\" size=\"icon\" className=\"relative\" data-testid=\"notifications-button\">
                      <Bell className=\"h-5 w-5\" />
                      {unreadCount > 0 && (
                        <Badge className=\"absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs\">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align=\"end\" className=\"w-80 bg-zinc-900 border-zinc-800\">
                    <DropdownMenuLabel className=\"flex items-center justify-between\">
                      Notifications
                      {unreadCount > 0 && (
                        <Button variant=\"ghost\" size=\"sm\" onClick={handleMarkAllRead}>
                          Mark all read
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className=\"bg-zinc-800\" />
                    <ScrollArea className=\"h-64\">
                      {notifications.length === 0 ? (
                        <div className=\"p-4 text-center text-zinc-500\">No notifications</div>
                      ) : (
                        notifications.slice(0, 10).map((notif) => (
                          <DropdownMenuItem
                            key={notif.id}
                            className={`flex flex-col items-start p-3 ${!notif.is_read ? 'bg-zinc-800/50' : ''}`}
                          >
                            <span className=\"font-medium\">{notif.title}</span>
                            <span className=\"text-sm text-zinc-400\">{notif.message}</span>
                          </DropdownMenuItem>
                        ))
                      )}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant=\"ghost\" size=\"icon\" data-testid=\"user-menu-button\">
                      <User className=\"h-5 w-5\" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align=\"end\" className=\"w-56 bg-zinc-900 border-zinc-800\">
                    <DropdownMenuLabel>
                      <div className=\"flex flex-col\">
                        <span>{user.full_name}</span>
                        <span className=\"text-xs text-zinc-400 capitalize\">{user.role}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className=\"bg-zinc-800\" />
                    <DropdownMenuItem asChild>
                      <Link to=\"/profile\" className=\"cursor-pointer\">
                        <Settings className=\"mr-2 h-4 w-4\" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className=\"bg-zinc-800\" />
                    <DropdownMenuItem onClick={handleLogout} className=\"text-red-500 cursor-pointer\">
                      <LogOut className=\"mr-2 h-4 w-4\" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className=\"flex items-center gap-2\">
                <Link to=\"/login\">
                  <Button variant=\"ghost\" data-testid=\"login-button\">Login</Button>
                </Link>
                <Link to=\"/register\">
                  <Button className=\"bg-amber-500 text-black hover:bg-amber-400 font-bold\" data-testid=\"register-button\">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
