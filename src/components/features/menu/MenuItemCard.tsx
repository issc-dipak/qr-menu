'use client';
import { Badge } from '@/components/ui/index';
import { Button as Btn } from '@/components/ui/Button';
import type { MenuItem } from '@/types';
import { formatCurrency } from '@/utils';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}

export function MenuItemCard({ item, onEdit, onDelete }: MenuItemCardProps) {
  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden transition-all duration-300 hover:border-accent/30 hover:-translate-y-0.5">
      {/* Photo/Emoji display */}
      <div className="h-36 bg-gradient-to-br from-surface-2 to-surface-3 flex items-center justify-center relative overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl">{item.emoji}</span>
        )}
        <Badge
          variant={item.status === 'active' ? 'green' : 'muted'}
          className="absolute top-3 right-3 text-[10px]"
        >
          {item.status}
        </Badge>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-sm">{item.name}</h3>
          <span className="font-display font-black text-accent text-base">
            {formatCurrency(item.price)}
          </span>
        </div>
        <p className="text-xs text-muted mb-1">{item.category}</p>
        {item.description && (
          <p className="text-xs text-muted/70 mb-3 line-clamp-1">{item.description}</p>
        )}

        <div className="flex gap-2">
          <Btn variant="ghost" size="sm" fullWidth onClick={() => onEdit(item)}>
            ✏️ Edit
          </Btn>
          <Btn variant="danger" size="sm" onClick={() => onDelete(item.id)}>
            🗑
          </Btn>
        </div>
      </div>
    </div>
  );
}

// Re-export Badge for convenience
export { Badge };
