import { STATUS_COLORS, STATUS_LABELS } from "@/lib/utils/constants";
import type { OrderStatus } from "@/types";

import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>;
}
