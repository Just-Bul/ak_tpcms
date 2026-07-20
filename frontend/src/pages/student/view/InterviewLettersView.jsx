import { useEffect, useState } from "react";
import { MessageSquare, Calendar, Download, Info } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { downloadInterviewLetter } from "@/utils/interviewLetter";
import { formatDateTime } from "@/utils/formatDateTime";

/**
 * Item 28 (student side) — previously a static "no letters" placeholder with no data fetching
 * at all. Interviews scheduled via the Company's ScheduleInterviews page are stored in
 * localStorage (`company_interviews`), since no backend interview model exists; this reads
 * that same key and matches on student_id. This is a genuine, disclosed limitation: since
 * localStorage isn't shared across devices/browsers, a student only sees interviews scheduled
 * from the same browser the company used — there is no way around this without a backend change.
 */
export default function InterviewLettersView() {
  const { userId } = useAuth();
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("company_interviews");
      const all = stored ? JSON.parse(stored) : [];
      setInterviews(all.filter((i) => i.student_id === userId));
    } catch {
      setInterviews([]);
    }
  }, [userId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-orbit-text-primary">Interview Letters</h1>
        <p className="text-sm text-slate-500 mt-1">View your interview call letters and schedule details.</p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-orbit-border bg-orbit-surface2/40 px-4 py-3 text-xs text-slate-500">
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        Interviews scheduled by a company only appear here if you're using the same browser they were scheduled from (no backend interview API exists yet to sync this across devices).
      </div>

      {interviews.length === 0 ? (
        <div className="bg-orbit-surface rounded-xl border border-orbit-border p-10 text-center">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No interview letters available.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <div
              key={interview.interview_id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-orbit-border bg-orbit-surface hover:border-orbit-border2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
                  <Calendar size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orbit-text-primary">{interview.job_title || "Interview"}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDateTime(`${interview.date}T${interview.time || "00:00"}`)}
                  </p>
                  <Badge variant="info" className="mt-1.5">{interview.mode || "Online"}</Badge>
                </div>
              </div>
              <Button size="sm" icon={<Download size={14} />} onClick={() => downloadInterviewLetter(interview)}>
                Download Letter
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
