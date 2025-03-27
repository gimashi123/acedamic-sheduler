import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card.tsx';
import { useSubject } from '@/context/subject/subject.context.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash } from 'lucide-react';

export function SubjectDashboard() {
  const navigate = useNavigate();

  const { subjects } = useSubject();
  return (
    <div>
      <div className="flex flex-row w-full justify-end mb-4">
        <Button
          className="cursor-pointer hover:bg-green-800"
          onClick={() => navigate('/admin/dashboard/subject/add')}
        >
          Add Subject
        </Button>
      </div>
      <Card className={'p-4'}>
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px] text-bold text-lg">
                Subject Name
              </TableHead>
              <TableHead className="w-[150px] text-bold text-lg">
                Module Code
              </TableHead>
              <TableHead className="w-[150px] text-bold text-lg">
                Credits
              </TableHead>
              <TableHead className="text-end w-[150px] text-bold text-lg">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects?.map((subject, index) => (
              <TableRow key={index}>
                <TableCell>{subject.name}</TableCell>
                <TableCell>{subject.code}</TableCell>
                <TableCell>{subject.credits}</TableCell>
                <TableCell className="text-end">
                  <div className={'space-x-2'}>
                    <Button
                      variant={'outline'}
                      size={'icon'}
                      className={'hover:bg-red-500 hover:text-white'}
                    >
                      <Trash className={'w-5 h-5 '} />
                    </Button>
                    <Button
                      variant={'outline'}
                      size={'icon'}
                      className={'hover:bg-green-500 hover:text-white'}
                    >
                      <Pencil className={'w-5 h-5'} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
