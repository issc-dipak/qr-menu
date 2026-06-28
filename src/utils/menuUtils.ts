export interface ParsedDiet {
  label: string;
  dotColor: string;
  cleanDescription: string;
  customLabel: string;
  isVeg: boolean;
}

export function parseMenuItemDiet(item: any): ParsedDiet {
  const isVeg = item.is_veg !== false;
  let label = isVeg ? 'Veg' : 'Non-Veg';
  let dotColor = isVeg ? '#10b981' : '#ef4444';
  let cleanDescription = item.description || '';
  let customLabel = '';

  if (cleanDescription.startsWith('[Diet:')) {
    const closeIdx = cleanDescription.indexOf(']');
    if (closeIdx !== -1) {
      customLabel = cleanDescription.substring(6, closeIdx).trim();
      cleanDescription = cleanDescription.substring(closeIdx + 1).trim();
      label = customLabel;
      dotColor = '#f59e0b'; // Amber color for custom dietary type
    }
  }

  return {
    label,
    dotColor,
    cleanDescription,
    customLabel,
    isVeg
  };
}
