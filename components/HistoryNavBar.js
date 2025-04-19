import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
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
                <div key={index} className="mb-4 p-2 bg-gray-100 rounded shadow">
                  <p className="font-medium">{item.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.timestamp).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                  <div className='w-26 h-7 flex justify-start rounded-sm bg-slate-400 text-white text-xs'>
                  <div className="text-xs m-2">Manifest generated for {item.deviceModel}</div>
                  </div>
                  
                  {index < history.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => onRevert(index + 1)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
