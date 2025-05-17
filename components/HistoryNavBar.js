import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const HistoryNavBar = ({ history, onRevert }) => {

  return (
    <div className='pt-4'>
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Shows the history of manifests generated for device model</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <ScrollArea className="flex-1">
              {history.map((item, index) => (
<div
  key={index}
  className="relative mb-4 bg-gray-100 rounded shadow px-4 py-2 flex items-center justify-between"
>

  <div className="absolute top-1 right-14 text-xs text-blue-700 font-semibold bg-blue-100 px-1 py-1">
    # {item.device}
  </div>

  {/* Timestamp and file name */}
  <div className="flex items-center gap-4 flex-wrap text-xs text-gray-700">
    <p>
      {new Date(item.timestamp).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}
    </p>
    <p className="font-semibold text-gray-900">{item.fileName}</p>
  </div>

  {/* Buttons */}
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="sm" onClick={() => onRevert(index)} title="Revert">
      <ArrowDownToLine className="h-4 w-4" />
    </Button>
  </div>
</div>
              ))}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
