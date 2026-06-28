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
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-white tracking-tight leading-tight">{t.menuPageTitle}</h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">{totalItems} {t.menuPageSubtitle}</p>
        </div>
        <Button size="sm" onClick={openAdd} leftIcon={<Plus className="w-4 h-4" />}>
          <span className="hidden xs:inline">{t.addItem}</span>
        </Button>
      </div>

      {/* Controls */}
      <div className="flex gap-3 items-center flex-wrap mb-5">
        {/* Search */}
        <div className="flex items-center bg-surface border border-border rounded-lg px-3 py-2 gap-2 flex-1 min-w-0 focus-within:border-accent/40 transition-colors">
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
