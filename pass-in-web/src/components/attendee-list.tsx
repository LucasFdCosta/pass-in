import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Search } from "lucide-react";
import { IconButton } from "./icon-button";
import { Table } from "./table/table";
import { TableHeader } from "./table/table-header";
import { TableCell } from "./table/table-cell";
import { TableRow } from "./table/TableRow";
import { ChangeEvent, useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime)

interface Attendee {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  checkedInAt: string | null;
}

export function AttendeeList() {
  const [search, setSearch] = useState(() => {
    const url = new URL(window.location.toString());

    if (url.searchParams.has("search")) {
      return url.searchParams.get("search") ?? "";
    } 

    return "";
  });

  const [page, setPage] = useState(() => {
    const url = new URL(window.location.toString());

    if (url.searchParams.has("page")) {
      return Number(url.searchParams.get("page"));
    } 

    return 1;
  });

  const [total, setTotal] = useState(0);
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  const [timeoutId, setTimeoutId] = useState<number | undefined>(undefined);

  const totalPages = Math.ceil(total / 10);

  function setCurrentSearch(search: string) {
    const url = new URL(window.location.toString());

    if (search.length === 0) {
      url.searchParams.delete("search")
    } else {
      url.searchParams.set("search", search)
    }


    window.history.pushState({}, "", url);

    setSearch(search);
  }

  function setCurrentPage(page: number) {
    const url = new URL(window.location.toString());

    url.searchParams.set("page", String(page))

    window.history.pushState({}, "", url);

    setPage(page);
  }

  function goToNextPage() {
    setCurrentPage(page + 1);
  }

  function goToPreviousPage() {
    setCurrentPage(page - 1);
  }

  function goToFirstPage() {
    setCurrentPage(1);
  }

  function goToLastPage() {
    setCurrentPage(totalPages);
  }

  function onSearchInputChanged(e: ChangeEvent<HTMLInputElement>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      setCurrentSearch(e.target.value);
      setCurrentPage(1);  
    }, 500);

    setTimeoutId(newTimeoutId);
  }

  useEffect(() => {
    const url = new URL("http://localhost:7031/api/attendees/8504B834-C819-48B3-9C47-81A1D358B148");

    url.searchParams.set("pageIndex", String(page - 1));
    
    if (search.length > 0) {
      url.searchParams.set("search", search);
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        setAttendees(data.attendees)
        setTotal(data.total)
      })
  }, [page, search])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-center">
        <h1 className="text-2xl font-bold">
          Attendees
        </h1>

        <div className="w-72 px-3 py-1.5 border border-white/10 rounded-lg text-sm flex items-center gap-3">
          <Search className="size-4 text-emerald-300" />
          <input
            onChange={onSearchInputChanged}
            defaultValue={search}
            className="bg-transparent h-auto border-0 p-0 text-sm ring-0 flex-1 outline-none focus:ring-0"
            placeholder="Search attendee..." />
        </div>
      </div>

      <Table>
        <thead>
          <tr className="border-b border-white/10">
            <TableHeader style={{ width: 48 }}>
              <input className="size-4 bg-black/20 rounded border border-white/10" type="checkbox" />
            </TableHeader>
            <TableHeader>Code</TableHeader>
            <TableHeader>Attendee</TableHeader>
            <TableHeader>Assign date</TableHeader>
            <TableHeader>Check-in date</TableHeader>
            <TableHeader style={{ width: 64 }}></TableHeader>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee: Attendee) => {
            return (
              <TableRow key={attendee.id}>
                <TableCell className="py-3 px-4 text-sm text-zinc-300">
                  <input className="size-4 bg-black/20 rounded border border-white/10" type="checkbox" />
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-zinc-300">{attendee.id}</TableCell>
                <TableCell className="py-3 px-4 text-sm text-zinc-300">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-white">{attendee.name}</span>
                    <span>{attendee.email}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4 text-sm text-zinc-300">{dayjs().to(attendee.createdAt)}</TableCell>
                <TableCell className="py-3 px-4 text-sm text-zinc-300">
                  {attendee.checkedInAt === null
                    ? <span className="text-zinc-400">Not checked-in</span>
                    : dayjs().to(attendee.checkedInAt)}
                  </TableCell>
                <TableCell className="py-3 px-4 text-sm text-zinc-300">
                  <IconButton transparent>
                    <MoreHorizontal className="size-4" />
                  </IconButton>
                </TableCell>
              </TableRow>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <TableCell colSpan={3}>Showing {attendees.length} out of {total} items</TableCell>
            <TableCell className="text-right" colSpan={3}>
              <div className="inline-flex items-center gap-8">
                <span>Page {page} of {totalPages}</span>

                <div className="flex gap-1.5">
                  <IconButton onClick={goToFirstPage} disabled={page === 1}>
                    <ChevronsLeft className="size-4" />
                  </IconButton>
                  <IconButton onClick={goToPreviousPage} disabled={page === 1}>
                    <ChevronLeft className="size-4" />
                  </IconButton>
                  <IconButton onClick={goToNextPage} disabled={page === totalPages}>
                    <ChevronRight className="size-4" />
                  </IconButton>
                  <IconButton onClick={goToLastPage} disabled={page === totalPages}>
                    <ChevronsRight className="size-4" />
                  </IconButton>
                </div>
              </div>
            </TableCell>
          </tr>
        </tfoot>
      </Table>
    </div>
  )
}