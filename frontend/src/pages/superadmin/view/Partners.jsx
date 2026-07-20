import { useEffect, useMemo, useState } from "react";
import DashboardShell from "../../../components/DashboardShell";
import {
  Card,
  CardBody,
  Button,
  Badge,
  Input,
} from "../../../components/ui";

import {
  Search,
  Loader2,
  Building2,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Briefcase,
  CalendarClock,
} from "lucide-react";

import { api } from "../../../services/api";

/* ── mock fallback for placements ─────────────────────────────────── */
const PAGE_SIZE = 8;

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Partners() {
  const [loading, setLoading] = useState(true);

  const [companies, setCompanies] = useState([]);
  const [placements, setPlacements] = useState([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null); // user_id of expanded company

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [companyRes, placementRes] = await Promise.all([
        api.get("/organizations?status=approved"),
        api.get("/placements"),
      ]);

      setCompanies(companyRes.data?.data || companyRes.data || []);

      const rawPlacements =
        placementRes.data?.data ||
        (Array.isArray(placementRes.data) ? placementRes.data : []);
      setPlacements(Array.isArray(rawPlacements) ? rawPlacements : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* ── search ─────────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    const kw = search.toLowerCase();
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(kw) ||
        c.user_table?.email?.toLowerCase().includes(kw) ||
        c.user_table?.mobile_no?.includes(search)
    );
  }, [companies, search]);

  /* ── pagination ──────────────────────────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── get placements for a company ───────────────────────────────── */
  function getCompanyPlacements(company) {
    return placements.filter(
      (p) =>
        p.creator_id === company.user_id ||
        p.organization_id === company.user_id
    );
  }

  return (
    <DashboardShell
      title="Recruitment Partners"
      subtitle="View approved company partners and their recent job postings"
    >
      {loading ? (
        <Card>
          <CardBody>
            <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
              <Loader2 className="animate-spin" size={18} />
              Loading partners...
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">

          {/* ── Stats ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card>
              <CardBody>
                <p className="text-sm text-slate-500">Total Partners</p>
                <h2 className="text-3xl font-bold text-orbit-text-primary mt-2">{companies.length}</h2>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-sm text-slate-500">Active Listings</p>
                <h2 className="text-3xl font-bold text-orbit-text-primary mt-2">
                  {placements.filter((p) => p.is_active).length}
                </h2>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-sm text-slate-500">Showing</p>
                <h2 className="text-3xl font-bold text-orbit-text-primary mt-2">{filtered.length}</h2>
              </CardBody>
            </Card>
          </div>

          {/* ── Search ── */}
          <Card>
            <CardBody>
              <div className="relative max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  className="pl-10"
                  placeholder="Search company, email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </CardBody>
          </Card>

          {/* ── Table ── */}
          <Card>
            {filtered.length === 0 ? (
              <CardBody>
                <div className="py-20 text-center">
                  <Building2 size={48} className="mx-auto text-slate-600 mb-3" />
                  <p className="text-slate-500">No recruitment partners found.</p>
                </div>
              </CardBody>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-orbit-border">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-8"></th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Listings</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((company) => {
                      const compPlacements = getCompanyPlacements(company);
                      const isExpanded = expanded === company.user_id;
                      return (
                        <>
                          <tr
                            key={company.user_id}
                            className="border-b border-orbit-border hover:bg-white/[0.02] cursor-pointer transition-colors"
                            onClick={() =>
                              setExpanded(isExpanded ? null : company.user_id)
                            }
                          >
                            <td className="px-5 py-4 text-slate-500">
                              {isExpanded
                                ? <ChevronDown size={15} />
                                : <ChevronRight size={15} />}
                            </td>
                            <td className="px-5 py-4 font-medium text-slate-200">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orbit-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Building2 size={14} className="text-orbit-primary" />
                                </div>
                                {company.name}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-400 text-xs">
                              <span className="flex items-center gap-1">
                                <Mail size={12} />
                                {company.user_table?.email || "—"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-slate-400 text-xs">
                              <span className="flex items-center gap-1">
                                <Phone size={12} />
                                {company.user_table?.mobile_no || "—"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-orbit-primary">
                                <Briefcase size={12} />
                                {compPlacements.length}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <Badge variant="success">Approved</Badge>
                            </td>
                          </tr>

                          {/* ── Expanded placements row ── */}
                          {isExpanded && (
                            <tr key={`${company.user_id}-detail`} className="bg-orbit-surface2/40">
                              <td colSpan={6} className="px-8 py-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                  Recent Job Listings from {company.name}
                                </p>
                                {compPlacements.length === 0 ? (
                                  <p className="text-xs text-slate-600 italic">No placements posted yet.</p>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {compPlacements.map((p) => (
                                      <div
                                        key={p.placement_id}
                                        className="rounded-xl border border-orbit-border bg-orbit-surface px-4 py-3 flex flex-col gap-1"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-slate-200 truncate">
                                            {p.title}
                                          </span>
                                          <Badge variant={p.is_active ? "success" : "neutral"} >
                                            {p.is_active ? "Active" : "Closed"}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                          <span>Min CGPA: <strong className="text-slate-300">{p.min_cgpa ?? "—"}</strong></span>
                                          <span className="flex items-center gap-1">
                                            <CalendarClock size={11} />
                                            {fmtDate(p.last_date_of_submission)}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* ── Pagination ── */}
          {filtered.length > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500">
                Showing page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

        </div>
      )}
    </DashboardShell>
  );
}
