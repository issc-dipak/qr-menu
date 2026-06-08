'use client';
import { Button } from '@/components/ui/Button';
import { MenuItemCard } from '@/components/features/menu/MenuItemCard';
import { MenuItemForm } from '@/components/features/menu/MenuItemForm';
import { useMenu } from '@/hooks';
import { MENU_CATEGORIES } from '@/constants';
import { cn } from '@/utils';

export default function MenuPage() {
  const {
    items, totalItems, search, setSearch,
    activeCategory, setActiveCategory,
    isModalOpen, editingItem,
    handleAdd, handleUpdate, handleDelete,
    openEdit, openAdd, closeModal,
  } = useMenu();

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-2xl">Menu Items</h1>
          <p className="text-muted text-sm mt-1">{totalItems} items in your menu</p>
        </div>
        <Button size="sm" onClick={openAdd}>+ Add Item</Button>
      </div>

      {/* Controls */}
      <div className="flex gap-3 items-center flex-wrap mb-5">
        {/* Search */}
        <div className="flex items-center bg-surface border border-border rounded-lg px-3 py-2 gap-2 flex-1 min-w-[200px]">
          <span className="text-muted text-sm">🔍</span>
          <input
            className="bg-transparent outline-none text-sm flex-1 text-[#f0f0f5] placeholder:text-muted"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto flex-nowrap scrollbar-none pb-1.5 -mx-4 px-4 md:mx-0 md:px-0 w-full md:w-auto">
          {['all', ...MENU_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3.5 py-2 rounded-lg border text-xs font-medium transition-all flex-shrink-0',
                activeCategory === cat
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'bg-transparent border-border text-muted hover:border-[#f0f0f5]/30 hover:text-[#f0f0f5]'
              )}
            >
              {cat === 'all' ? 'All' : cat}
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
          className="bg-surface-2 border-2 border-dashed border-border rounded-card flex flex-col items-center justify-center gap-3 min-h-[250px] cursor-pointer hover:border-accent hover:bg-accent/4 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-2xl">+</div>
          <span className="text-sm text-muted">Add New Item</span>
        </button>
      </div>

      {/* Empty */}
      {items.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🍽️</p>
          <p className="font-display font-bold text-lg mb-2">No items found</p>
          <p className="text-muted text-sm mb-6">Try a different search or category</p>
          <Button size="sm" onClick={openAdd}>Add Your First Item</Button>
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
