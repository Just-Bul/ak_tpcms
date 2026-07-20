import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "../../../components/DashboardShell";
import {
  Card,
  CardBody,
  Button,
  Input,
  Badge,
} from "../../../components/ui";
import {
  Loader2,
  Search,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  fetchCoordinators,
  deleteCoordinator,
} from "../../../services/coordinatorApi";

const PAGE_SIZE = 10;

export default function ViewCoordinators() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const [coordinators, setCoordinators] = useState([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  async function loadCoordinators() {
    try {
      setLoading(true);

      const data = await fetchCoordinators();

      setCoordinators(data || []);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoordinators();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();

    return coordinators.filter((c) => {
      return (
        c.name?.toLowerCase().includes(keyword) ||
        c.email?.toLowerCase().includes(keyword) ||
        c.mobile_no?.includes(search) ||
        c.department_table?.dept_name
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [coordinators, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [totalPages]);

  async function handleDelete(coordinator) {
    const id = coordinator.user_id;

    if (!window.confirm("Delete this coordinator?")) {
      return;
    }

    try {
      setDeleting(id);

      await deleteCoordinator(id);

      await loadCoordinators();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  }

  function handleEdit(coordinator) {
    navigate(
      `/super-admin/dashboard?view=edit-coordinator&id=${coordinator.user_id}`
    );
  }
    return (
    <DashboardShell
      title="View T&P Coordinators"
      subtitle="Manage Training & Placement Coordinators"
    >
      <Card>
        <CardBody>

          {/* Search */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div className="relative w-full md:w-96">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <Input
                placeholder="Search coordinator..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            <Badge variant="neutral">
              {filtered.length} Coordinator
              {filtered.length !== 1 && "s"}
            </Badge>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={18} />
              Loading coordinators...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <UserRound
                size={40}
                className="mx-auto text-slate-600 mb-3"
              />

              <p className="text-slate-400">
                No coordinators found.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-orbit-border">
                <table className="w-full text-sm">
                  <thead className="bg-orbit-surface2">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        Name
                      </th>

                      <th className="px-4 py-3 text-left">
                        Email
                      </th>

                      <th className="px-4 py-3 text-left">
                        Mobile
                      </th>

                      <th className="px-4 py-3 text-left">
                        Department
                      </th>

                      <th className="px-4 py-3 text-center">
                        Status
                      </th>

                      <th className="px-4 py-3 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginated.map((c) => (
                      <tr
                        key={c.user_id}
                        className="border-t border-orbit-border hover:bg-orbit-surface2/40"
                      >
                        <td className="px-4 py-4 font-medium text-slate-200">
                          {c.name}
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {c.email}
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {c.mobile_no}
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {c.department_table?.dept_name ??
                            "-"}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <Badge
                            variant={
                              c.is_active
                                ? "success"
                                : "danger"
                            }
                          >
                            {c.is_active
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                handleEdit(c)
                              }
                            >
                              <Pencil size={15} />
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              loading={
                                deleting === c.user_id
                              }
                              onClick={() =>
                                handleDelete(c)
                              }
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}

              <div className="flex justify-between items-center mt-6">

                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </p>

                <div className="flex gap-2">

                  <Button
                    variant="ghost"
                    disabled={page === 1}
                    onClick={() =>
                      setPage((p) => p - 1)
                    }
                  >
                    Previous
                  </Button>

                  <Button
                    variant="ghost"
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((p) => p + 1)
                    }
                  >
                    Next
                  </Button>

                </div>

              </div>
            </>
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}