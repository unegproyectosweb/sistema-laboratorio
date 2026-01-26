import { Card, CardTitle } from "@/components/ui/card";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
} from "lucide-react";

interface StatsCardsProps {
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  canceladas: number;
  total: number;
}

export function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="border-orange-200 bg-linear-to-br from-orange-50 to-white p-4 max-md:gap-1 max-md:p-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-slate-700">
              Pendientes
            </CardTitle>
            <div className="text-2xl font-bold text-orange-600">
              {props.pendientes}
            </div>
          </div>
          <ClockIcon className="size-8 text-orange-600 md:size-4" />
        </div>
      </Card>

      <Card className="border-green-200 bg-linear-to-br from-green-50 to-white p-4 max-md:gap-1 max-md:p-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-slate-700">
              Aprobadas
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">
              {props.aprobadas}
            </div>
          </div>
          <CheckCircle2Icon className="size-8 text-green-600 md:size-4" />
        </div>
      </Card>

      <Card className="border-red-200 bg-linear-to-br from-red-50 to-white p-4 max-md:gap-1 max-md:p-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-slate-700">
              Rechazadas
            </CardTitle>
            <div className="text-2xl font-bold text-red-600">
              {props.rechazadas}
            </div>
          </div>
          <XCircleIcon className="size-8 text-red-600 md:size-4" />
        </div>
      </Card>

      <Card className="border-gray-200 bg-linear-to-br from-gray-50 to-white p-4 max-md:gap-1 max-md:p-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-slate-700">
              Canceladas
            </CardTitle>
            <div className="text-2xl font-bold text-gray-600">
              {props.canceladas}
            </div>
          </div>
          <XCircleIcon className="size-8 text-gray-600 md:size-4" />
        </div>
      </Card>

      <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-white p-4 max-md:gap-1 max-md:p-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-slate-700">
              Total
            </CardTitle>
            <div className="text-2xl font-bold text-blue-600">
              {props.total}
            </div>
          </div>
          <CalendarIcon className="size-8 text-blue-600 md:size-4" />
        </div>
      </Card>
    </div>
  );
}
