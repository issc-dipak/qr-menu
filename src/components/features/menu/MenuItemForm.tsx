'use client';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/index';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { ITEM_EMOJIS, MENU_CATEGORIES } from '@/constants';
import { cn } from '@/utils';
import type { MenuItem, MenuItemCategory } from '@/types';
import { useAuthStore } from '@/store';
import { uploadMenuItemImage } from '@/services/menuService';
import toast from 'react-hot-toast';

interface MenuItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingItem?: MenuItem | null;
}

const CATEGORY_OPTIONS = MENU_CATEGORIES.map((c) => ({ value: c, label: c }));

export function MenuItemForm({ isOpen, onClose, onSubmit, editingItem }: MenuItemFormProps) {
  const { owner } = useAuthStore();
  const [emoji, setEmoji] = useState('🍵');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<MenuItemCategory>('Hot Drinks');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFree = !owner || owner.plan === 'free';

  useEffect(() => {
    if (editingItem) {
      setEmoji(editingItem.emoji);
      setName(editingItem.name);
      setDescription(editingItem.description || '');
      setPrice(String(editingItem.price));
      setCategory(editingItem.category as MenuItemCategory);
      setImageUrl(editingItem.image_url || '');
    } else {
      setEmoji('🍵');
      setName('');
      setDescription('');
      setPrice('');
      setCategory('Hot Drinks');
      setImageUrl('');
    }
    setErrors({});
  }, [editingItem, isOpen]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Item name is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) e.price = 'Valid price is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !owner) return;

    if (isFree) {
      toast.error('Upgrade to Pro or Business to upload photos!');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading photo...');
    try {
      const tempId = editingItem?.id || 'img-' + Math.random().toString(36).substring(2, 11);
      const url = await uploadMenuItemImage(owner.id, tempId, file);
      setImageUrl(url);
      toast.success('Photo uploaded! 📸', { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      emoji,
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      status: 'active',
      image_url: imageUrl || null,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingItem ? 'Edit Item' : 'Add Menu Item'}>
      <div className="space-y-4">
        {/* Photo Upload Section */}
        <div className="border border-border rounded-xl p-4 bg-surface-2/40">
          <p className="text-xs font-bold tracking-wider uppercase text-muted mb-2 flex items-center justify-between">
            <span>Item Photo</span>
            {isFree && (
              <span className="text-[10px] text-accent-2 bg-accent-2/10 px-2 py-0.5 rounded-full">
                🔒 Premium Feature
              </span>
            )}
          </p>
          
          <div className="flex items-center gap-4">
            {imageUrl ? (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-border group">
                <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-danger font-bold transition-all border-none cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-surface-2 border border-dashed border-border flex items-center justify-center text-2xl text-muted">
                📷
              </div>
            )}
            
            <div className="flex-1">
              {isFree ? (
                <div>
                  <p className="text-xs text-muted leading-relaxed mb-1">Upgrade your plan to replace the emoji with a real photo.</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      window.location.href = '/dashboard/billing';
                    }}
                    className="text-xs text-accent font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    Upgrade to Pro/Business ⚡
                  </button>
                </div>
              ) : (
                <label className="inline-block">
                  <span className={cn(
                    "px-4 py-2 bg-surface-2 border border-border text-xs rounded-xl cursor-pointer hover:border-accent font-semibold transition-all inline-block",
                    uploading && "opacity-50 pointer-events-none"
                  )}>
                    {uploading ? 'Uploading...' : 'Choose Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Emoji Picker */}
        <div>
          <p className="text-xs font-bold tracking-wider uppercase text-muted mb-2">Choose Emoji (Fallback)</p>
          <div className="grid grid-cols-8 gap-1.5 max-h-[120px] overflow-y-auto pr-1">
            {ITEM_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  'text-xl p-1.5 rounded-lg transition-all text-center border-2',
                  emoji === e
                    ? 'border-accent bg-accent/10'
                    : 'border-transparent hover:bg-surface-2'
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <Input label="Item Name *" placeholder="e.g. Masala Chai" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <Textarea label="Description" placeholder="Short description..." value={description} onChange={(e) => setDescription(e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Price (₹) *" type="number" placeholder="20" value={price} onChange={(e) => setPrice(e.target.value)} error={errors.price} />
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value as MenuItemCategory)} options={CATEGORY_OPTIONS} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth onClick={handleSubmit}>
            {editingItem ? 'Save Changes' : 'Add Item ✓'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
