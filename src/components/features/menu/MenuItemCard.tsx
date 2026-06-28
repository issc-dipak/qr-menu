'use client';
import { Badge } from '@/components/ui/index';
import { Button as Btn } from '@/components/ui/Button';
import type { MenuItem } from '@/types';
import { formatCurrency } from '@/utils';
import { Edit2, Trash2 } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}

export function MenuItemCard({ item, onEdit, onDelete }: MenuItemCardProps) {
  const isVeg = (item as any).is_veg !== false;
  const dotColor = isVeg ? '#10b981' : '#ef4444'; // clean emerald vs red

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden transition-all duration-300 hover:border-border-2 hover:bg-surface-2 hover:shadow-md">
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
        <div className="flex items-start justify-between mb-1.5 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0 rounded-[3px]"
              style={{
                borderColor: dotColor,
                padding: '1px'
              }}
              title={isVeg ? 'Veg' : 'Non-Veg'}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: dotColor
                }}
              />
            </span>
            <h3 className="font-semibold text-sm truncate text-[#f0f0f5]">{item.name}</h3>
          </div>
          <span className="font-display font-bold text-white text-base flex-shrink-0">
            {formatCurrency(item.price)}
          </span>
        </div>
        <p className="text-[11px] text-muted font-medium mb-1">{item.category}</p>
        {item.description && (
          <p className="text-xs text-muted/60 mb-4 line-clamp-1">{item.description}</p>
        )}

        <div className="flex gap-2">
          <Btn variant="ghost" size="sm" fullWidth onClick={() => onEdit(item)} leftIcon={<Edit2 className="w-3 h-3" />}>
            Edit
          </Btn>
          <Btn variant="danger" size="sm" onClick={() => onDelete(item.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Btn>
        </div>
      </div>
    </div>
  );
}

// Re-export Badge for convenience
export { Badge };
