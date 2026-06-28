'use client';
import { Badge } from '@/components/ui/index';
import { Button as Btn } from '@/components/ui/Button';
import type { MenuItem } from '@/types';
import { formatCurrency } from '@/utils';
import { Edit2, Trash2 } from 'lucide-react';
import { parseMenuItemDiet } from '@/utils/menuUtils';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}

export function MenuItemCard({ item, onEdit, onDelete }: MenuItemCardProps) {
  const { label, dotColor, cleanDescription } = parseMenuItemDiet(item);

  return (
    <div className="bg-surface border border-border rounded-card overflow-hidden transition-all duration-300 hover:border-border-2 hover:bg-surface-2 hover:shadow-md flex flex-row sm:flex-col h-auto min-h-0">
      {/* Photo/Emoji display */}
      <div className="w-24 h-24 xs:w-28 xs:h-28 sm:w-full sm:h-36 bg-gradient-to-br from-surface-2 to-surface-3 flex items-center justify-center relative overflow-hidden flex-shrink-0">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl sm:text-6xl">{item.emoji}</span>
        )}
        <Badge
          variant={item.status === 'active' ? 'green' : 'muted'}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[9px] sm:text-[10px]"
        >
          {item.status}
        </Badge>
      </div>

      <div className="p-3 sm:p-4 flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-1 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-3.5 h-3.5 border flex items-center justify-center flex-shrink-0 rounded-[3px]"
                style={{
                  borderColor: dotColor,
                  padding: '1px'
                }}
                title={label}
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
            <span className="font-display font-bold text-white text-sm sm:text-base flex-shrink-0">
              {formatCurrency(item.price)}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted font-medium mb-1">{item.category}</p>
          {cleanDescription && (
            <p className="text-xs text-muted/60 mb-2 sm:mb-4 line-clamp-1 hidden xs:block">{cleanDescription}</p>
          )}
        </div>

        <div className="flex gap-2 mt-2 sm:mt-0">
          <Btn variant="ghost" size="sm" className="flex-1 text-xs py-1.5 sm:py-2" onClick={() => onEdit(item)} leftIcon={<Edit2 className="w-3 h-3" />}>
            Edit
          </Btn>
          <Btn variant="danger" size="sm" className="px-2.5 py-1.5 sm:py-2" onClick={() => onDelete(item.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Btn>
        </div>
      </div>
    </div>
  );
}

// Re-export Badge for convenience
export { Badge };
