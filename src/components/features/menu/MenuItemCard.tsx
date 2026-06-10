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
        <div className="flex items-start justify-between mb-1 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0"
              style={{
                borderColor: (item as any).is_veg !== false ? '#00e5a0' : '#ea4335',
                padding: '1px'
              }}
              title={(item as any).is_veg !== false ? 'Veg' : 'Non-Veg'}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: (item as any).is_veg !== false ? '#00e5a0' : '#ea4335'
                }}
              />
            </span>
            <h3 className="font-semibold text-sm truncate">{item.name}</h3>
          </div>
          <span className="font-display font-black text-accent text-base flex-shrink-0">
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
