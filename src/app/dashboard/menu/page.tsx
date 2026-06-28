'use client';
import { Button } from '@/components/ui/Button';
import { MenuItemCard } from '@/components/features/menu/MenuItemCard';
import { MenuItemForm } from '@/components/features/menu/MenuItemForm';
import { useMenu } from '@/hooks';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils';
import { useMenuStore } from '@/store';
import { Search, Plus, Utensils } from 'lucide-react';

export default function MenuPage() {
  const {
    items, totalItems, search, setSearch,
    activeCategory, setActiveCategory,
    isModalOpen, editingItem,
    handleAdd, handleUpdate, handleDelete,
    openEdit, openAdd, closeModal,
  } = useMenu();
  const { t } = useTranslation('owner');

  const rawItems = useMenuStore((state) => state.items);
  const dynamicCategories = Array.from(
    new Set([
      'Hot Drinks',
      'Cold Drinks',
      'Snacks',
      'Main Course',
      'Desserts',
      ...rawItems.map((item) => item.category),
    ])
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">{t.menuPageTitle}</h1>
          <p className="text-muted text-sm mt-1">{totalItems} {t.menuPageSubtitle}</p>
        </div>
        <Button size="sm" onClick={openAdd} leftIcon={<Plus className="w-4 h-4" />}>
          {t.addItem}
        </Button>
      </div>

      {/* Controls */}
      <div className="flex gap-3 items-center flex-wrap mb-5">
        {/* Search */}
        <div className="flex items-center bg-surface border border-border rounded-lg px-3 py-2 gap-2 flex-1 min-w-[200px] focus-within:border-accent/40 transition-colors">
          <Search className="text-muted w-4 h-4 flex-shrink-0" />
          <input
            className="bg-transparent outline-none text-sm flex-1 text-[#f0f0f5] placeholder:text-muted/60"
            placeholder={t.searchItems}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto flex-nowrap scrollbar-none pb-1.5 -mx-4 px-4 md:mx-0 md:px-0 w-full md:w-auto">
          {['all', ...dynamicCategories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3.5 py-2 rounded-lg border text-xs font-medium transition-all flex-shrink-0 cursor-pointer',
                activeCategory === cat
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-transparent border-border text-muted hover:border-border-2 hover:text-[#f0f0f5]'
              )}
            >
              {cat === 'all' ? t.all : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} />
        ))}

        {/* Add Card */}
        <button
          onClick={openAdd}
          className="bg-surface border-2 border-dashed border-border rounded-card flex flex-col items-center justify-center gap-3 min-h-[250px] cursor-pointer hover:border-accent/40 hover:bg-accent/[0.02] transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm text-muted font-medium">Add New Item</span>
        </button>
      </div>

      {/* Empty */}
      {items.length === 0 && (
        <div className="text-center py-20 bg-surface/30 border border-border rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-muted/10 flex items-center justify-center text-muted mx-auto mb-4">
            <Utensils className="w-6 h-6" />
          </div>
          <p className="font-display font-semibold text-white text-lg mb-1">No items found</p>
          <p className="text-muted text-sm mb-6">Try a different search or category</p>
          <Button size="sm" onClick={openAdd} leftIcon={<Plus className="w-4 h-4" />}>Add Your First Item</Button>
        </div>
      )}

      {/* Form Modal */}
      <MenuItemForm
        isOpen={isModalOpen}
        onClose={closeModal}
        editingItem={editingItem}
        onSubmit={editingItem ? (data) => handleUpdate(editingItem.id, data) : handleAdd}
      />
    </div>
  );
}
