import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { partsAPI } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, PART_CATEGORIES } from '../lib/utils';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Search, Filter, ShoppingCart, Plus, Minus, Box, Store, Tag } from 'lucide-react';

export default function Parts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [selectedPart, setSelectedPart] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchParts();
  }, [category]);

  const fetchParts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (search) params.search = search;
      const response = await partsAPI.getAll(params);
      setParts(response.data);
    } catch (error) {
      console.error('Failed to fetch parts:', error);
      toast.error('Failed to load parts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchParts();
    if (search) {
      setSearchParams({ search, ...(category && { category }) });
    }
  };

  const handleAddToCart = (part) => {
    addItem(part, quantity);
    toast.success(`Added ${quantity}x ${part.name} to cart`);
    setSelectedPart(null);
    setQuantity(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Browse Spare Parts</h1>
        <p className="text-zinc-400">Find and order genuine spare parts from trusted vendors</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search parts by name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-amber-500 h-12"
              data-testid="parts-search"
            />
          </div>
          <Button type="submit" className="bg-amber-500 text-black hover:bg-amber-400 font-bold">
            Search
          </Button>
        </form>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-48 bg-zinc-900/50 border-zinc-800 h-12" data-testid="category-filter">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="">All Categories</SelectItem>
            {PART_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-zinc-900/50 border-zinc-800 animate-pulse">
              <div className="h-40 bg-zinc-800" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-4 bg-zinc-800 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : parts.length === 0 ? (
        <div className="text-center py-16">
          <Box className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
          <h2 className="text-xl font-bold mb-2">No parts found</h2>
          <p className="text-zinc-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {parts.map((part) => (
            <Dialog key={part.id}>
              <DialogTrigger asChild>
                <Card 
                  className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group"
                  onClick={() => setSelectedPart(part)}
                  data-testid={`part-card-${part.id}`}
                >
                  <div className="h-40 bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {part.image_url ? (
                      <img src={part.image_url} alt={part.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <Box className="h-12 w-12 text-zinc-600" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Badge className="mb-2 bg-zinc-800 text-zinc-400 text-xs">{part.category}</Badge>
                    <h3 className="font-bold truncate">{part.name}</h3>
                    <p className="text-xs text-zinc-400 font-mono mb-2">SKU: {part.sku}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-500">{formatPrice(part.price)}</span>
                      <span className={`text-xs ${part.quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {part.quantity > 0 ? `${part.quantity} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-zinc-400">
                      <Store className="h-3 w-3" />
                      {part.vendor_name}
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black">{part.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="h-48 bg-zinc-800 rounded-md flex items-center justify-center">
                    {part.image_url ? (
                      <img src={part.image_url} alt={part.name} className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <Box className="h-16 w-16 text-zinc-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-zinc-800 text-zinc-400">{part.category}</Badge>
                    {part.brand && <Badge className="bg-zinc-800 text-zinc-400">{part.brand}</Badge>}
                  </div>
                  <p className="text-zinc-400">{part.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="label-text">SKU</span>
                      <p className="font-mono">{part.sku}</p>
                    </div>
                    <div>
                      <span className="label-text">Vendor</span>
                      <p>{part.vendor_name}</p>
                    </div>
                    <div>
                      <span className="label-text">Stock</span>
                      <p className={part.quantity > 0 ? 'text-green-500' : 'text-red-500'}>
                        {part.quantity} available
                      </p>
                    </div>
                    <div>
                      <span className="label-text">Price</span>
                      <p className="font-mono font-bold text-amber-500 text-lg">{formatPrice(part.price)}</p>
                    </div>
                  </div>
                  {user?.role === 'client' && part.quantity > 0 && (
                    <div className="flex items-center gap-4 pt-4 border-t border-zinc-800">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="border-zinc-700"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-mono">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.min(part.quantity, quantity + 1))}
                          className="border-zinc-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(part)}
                        className="flex-1 bg-amber-500 text-black hover:bg-amber-400 font-bold btn-press"
                        data-testid="add-to-cart"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart ({formatPrice(part.price * quantity)})
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}
