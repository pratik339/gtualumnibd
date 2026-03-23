import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryItem {
  name: string;
  count: number;
}

interface CategoryListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  items: CategoryItem[];
  icon: 'city' | 'college';
  onItemClick: (name: string) => void;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function CategoryListModal({
  open,
  onOpenChange,
  title,
  subtitle,
  items,
  icon,
  onItemClick,
}: CategoryListModalProps) {
  const Icon = icon === 'city' ? MapPin : Building2;
  const totalMembers = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {title}
            <Badge variant="secondary" className="ml-2">
              {items.length} {icon === 'city' ? 'cities' : 'colleges'}
            </Badge>
          </DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>

        <ScrollArea className="h-[55vh] pr-3">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No data found
            </div>
          ) : (
            <div className="space-y-1.5">
              {items.map((item, index) => {
                const percentage = totalMembers > 0
                  ? Math.round((item.count / totalMembers) * 100)
                  : 0;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onItemClick(item.name)}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-all group hover:shadow-sm"
                  >
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
                      style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: COLORS[index % COLORS.length] }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{percentage}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-lg font-bold text-primary">{item.count}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
