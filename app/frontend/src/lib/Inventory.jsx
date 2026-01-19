import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { partsAPI } from '../lib/api';
import { formatPrice, PART_CATEGORIES } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Box, Search, AlertTriangle } from 'lucide-react';

const emptyPart = {
  name: '',
  description: '',
  category: '',
  price: '',
  quantity: '',
  sku: '',
  image_url: '',
  brand: '',
};

export default function Inventory() {
  const { user } = useAuth();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState(emptyPart);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const response = await partsAPI.getAll({ vendor_id: user?.id });
      setParts(response.data);
    } catch (error) {
      console.error('Failed to fetch parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (part = null) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        name: part.name,
        description: part.description,
        category: part.category,
        price: part.price.toString(),
        quantity: part.quantity.toString(),
        sku: part.sku,
        image_url: part.image_url || '',
        brand: part.brand || '',
      });
    } else {
      setEditingPart(null);
      setFormData(emptyPart);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
      };

      if (editingPart) {
        await partsAPI.update(editingPart.id, payload);
        toast.success('Part updated successfully');
      } else {
        await partsAPI.create(payload);
        toast.success('Part added successfully');
      }

      setDialogOpen(false);
      fetchParts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save part');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (partId) => {
    if (!window.confirm('Are you sure you want to delete this part?')) return;

    try {
      await partsAPI.delete(partId);
      toast.success('Part deleted');
      fetchParts();
    } catch (error) {
      toast.error('Failed to delete part');
    }
  };

  const filteredParts = parts.filter(
    (part) =>
      part.name.toLowerCase().includes(search.toLowerCase()) ||
      part.sku.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockParts = parts.filter((p) => p.quantity < 5);

  return (
    <div className= "container mx-auto px-4 py-8 ">
      <div className= "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 ">
        <div>
          <h1 className= "text-3xl font-black ">Inventory</h1>
          <p className= "text-zinc-400 ">Manage your spare parts inventory</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className= "bg-amber-500 text-black hover:bg-amber-400 font-bold "
              data-testid= "add-part-btn "
            >
              <Plus className= "h-4 w-4 mr-2 " />
              Add Part
            </Button>
          </DialogTrigger>
          <DialogContent className= "bg-zinc-900 border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto ">
            <DialogHeader>
              <DialogTitle>{editingPart ? 'Edit Part' : 'Add New Part'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className= "space-y-4 ">
              <div className= "grid grid-cols-2 gap-4 ">
                <div className= "space-y-2 ">
                  <Label className= "label-text ">Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className= "bg-black/20 border-zinc-800 focus:border-amber-500 "
                    data-testid= "part-name "
                  />
                </div>
                <div className= "space-y-2 ">
                  <Label className= "label-text ">SKU *</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    className= "bg-black/20 border-zinc-800 focus:border-amber-500 font-mono "
                    data-testid= "part-sku "
                  />
                </div>
              </div>
              <div className= "space-y-2 ">
                <Label className= "label-text ">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className= "bg-black/20 border-zinc-800 " data-testid= "part-category ">
                    <SelectValue placeholder= "Select category " />
                  </SelectTrigger>
                  <SelectContent className= "bg-zinc-900 border-zinc-800 ">
                    {PART_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className= "space-y-2 ">
                <Label className= "label-text ">Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className= "bg-black/20 border-zinc-800 focus:border-amber-500 "
                  data-testid= "part-description "
                />
              </div>
              <div className= "grid grid-cols-2 gap-4 ">
                <div className= "space-y-2 ">
                  <Label className= "label-text ">Price (₦) *</Label>
                  <Input
                    type= "number "
                    min= "0 "
                    step= "0.01 "
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className= "bg-black/20 border-zinc-800 focus:border-amber-500 font-mono "
                    data-testid= "part-price "
                  />
                </div>
                <div className= "space-y-2 ">
                  <Label className= "label-text ">Quantity *</Label>
                  <Input
                    type= "number "
                    min= "0 "
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    className= "bg-black/20 border-zinc-800 focus:border-amber-500 font-mono "
                    data-testid= "part-quantity "
                  />
                </div>
              </div>
              <div className= "grid grid-cols-2 gap-4 ">
                <div className= "space-y-2 ">
                  <Label className= "label-text ">Brand</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className= "bg-black/20 border-zinc-800 focus:border-amber-500 "
                  />
                </div>
                <div className= "space-y-2 ">
                  <Label className= "label-text ">Image URL</Label>
                  <Input
                    type= "url "
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className= "bg-black/20 border-zinc-800 focus:border-amber-500 "
                  />
                </div>
              </div>
              <div className= "flex gap-2 pt-4 ">
                <Button
                  type= "button "
                  variant= "outline "
                  onClick={() => setDialogOpen(false)}
                  className= "flex-1 border-zinc-700 "
                >
                  Cancel
                </Button>
                <Button
                  type= "submit "
                  disabled={saving}
                  className= "flex-1 bg-amber-500 text-black hover:bg-amber-400 font-bold "
                  data-testid= "save-part "
                >
                  {saving ? 'Saving...' : editingPart ? 'Update Part' : 'Add Part'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockParts.length > 0 && (
        <Card className= "bg-red-500/10 border-red-500/20 mb-6 ">
          <CardContent className= "p-4 flex items-center gap-3 ">
            <AlertTriangle className= "h-5 w-5 text-red-500 " />
            <span className= "text-red-500 ">
              {lowStockParts.length} part{lowStockParts.length > 1 ? 's' : ''} running low on stock
            </span>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className= "relative mb-6 ">
        <Search className= "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 " />
        <Input
          placeholder= "Search by name or SKU... "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className= "pl-10 bg-zinc-900/50 border-zinc-800 focus:border-amber-500 h-12 "
        />
      </div>

      {/* Parts Grid */}
      {loading ? (
        <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className= "bg-zinc-900/50 border-zinc-800 animate-pulse ">
              <CardContent className= "p-4 ">
                <div className= "h-4 bg-zinc-800 rounded w-3/4 mb-2 " />
                <div className= "h-4 bg-zinc-800 rounded w-1/2 " />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredParts.length === 0 ? (
        <div className= "text-center py-16 ">
          <Box className= "h-16 w-16 mx-auto text-zinc-600 mb-4 " />
          <h2 className= "text-xl font-bold mb-2 ">No parts found</h2>
          <p className= "text-zinc-400 mb-8 ">
            {search ? 'Try a different search term' : 'Add your first spare part to get started'}
          </p>
        </div>
      ) : (
        <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {filteredParts.map((part) => (
            <Card key={part.id} className= "bg-zinc-900/50 border-zinc-800 " data-testid={`inventory-part-${part.id}`}>
              <CardContent className= "p-4 ">
                <div className= "flex justify-between items-start mb-3 ">
                  <div>
                    <Badge className= "mb-2 bg-zinc-800 text-zinc-400 text-xs ">{part.category}</Badge>
                    <h3 className= "font-bold ">{part.name}</h3>
                    <p className= "text-xs text-zinc-400 font-mono ">SKU: {part.sku}</p>
                  </div>
                  <div className= "flex gap-1 ">
                    <Button
                      variant= "ghost "
                      size= "icon "
                      onClick={() => handleOpenDialog(part)}
                      className= "h-8 w-8 "
                    >
                      <Pencil className= "h-4 w-4 " />
                    </Button>
                    <Button
                      variant= "ghost "
                      size= "icon "
                      onClick={() => handleDelete(part.id)}
                      className= "h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10 "
                    >
                      <Trash2 className= "h-4 w-4 " />
                    </Button>
                  </div>
                </div>
                <div className= "flex justify-between items-end ">
                  <div>
                    <p className= "font-mono font-bold text-amber-500 ">{formatPrice(part.price)}</p>
                    <p className={`text-sm ${part.quantity < 5 ? 'text-red-500' : 'text-zinc-400'}`}>
                      {part.quantity} in stock
                    </p>
                  </div>
                  {part.brand && (
                    <Badge variant= "outline " className= "border-zinc-700 text-xs ">
                      {part.brand}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
