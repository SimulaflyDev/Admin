"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useAuthStore } from "@/lib/auth-store"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Search, AlertTriangle, CheckCircle2, Clock, MessageSquare, ShieldAlert,
  X, Send, User, Store, Loader2,
} from "lucide-react"
import {
  listTickets,
  getTicket,
  respondTicket,
  updateTicketStatus,
  type SupportTicketListItem,
  type SupportTicketDetail,
  type SupportTicketStatus,
  type SupportTicketPriority,
  type SupportRequesterType,
} from "@/lib/api/ops"
import { ApiError } from "@/lib/api/types"

const PAGE_SIZE = 25

const statusBadge: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
}

const priorityBadge: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-sky-100 text-sky-700 border-sky-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-rose-100 text-rose-700 border-rose-200",
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export default function SupportHub({ initialTicketId }: { initialTicketId?: string }) {
  const permissions = useAuthStore((state) => state.permissions)
  const canRespond = permissions.includes('*') || permissions.includes('support.respond')
  const canEditHelp = permissions.includes('*') || permissions.includes('content.manage')
  const [actionError, setActionError] = useState<string | null>(null)
  const replyAttempt = useRef<{ticket: string; body: string; id: string} | null>(null)
  const selectionRequest = useRef(0)
  const listRequest = useRef(0)
  const [tickets, setTickets] = useState<SupportTicketListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [priority, setPriority] = useState<string>("all")
  const [requesterType, setRequesterType] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selected, setSelected] = useState<SupportTicketDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchTickets = useCallback(async () => {
    const sequence = ++listRequest.current
    setLoading(true)
    setError(null)
    try {
      const res = await listTickets({
        page,
        page_size: PAGE_SIZE,
        search: debounced || undefined,
        sort: "-created_at",
        status: status === "all" ? undefined : (status as SupportTicketStatus),
        priority: priority === "all" ? undefined : (priority as SupportTicketPriority),
        requester_type:
          requesterType === "all" ? undefined : (requesterType as SupportRequesterType),
      })
      if (sequence === listRequest.current) { setTickets(res.items); setTotal(res.total) }
    } catch (err) {
      if (sequence === listRequest.current) {
        setError(err instanceof ApiError ? err.message : "Failed to load support tickets.")
        setTickets([])
      }
    } finally {
      if (sequence === listRequest.current) setLoading(false)
    }
  }, [page, debounced, status, priority, requesterType])

  useEffect(() => {
    // Starts a network synchronization on filter changes; loading is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchTickets()
  }, [fetchTickets])

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void fetchTickets()
    }, 30000)
    return () => window.clearInterval(timer)
  }, [fetchTickets])

  useEffect(() => {
    if (!initialTicketId) return
    let active = true
    const sequence = ++selectionRequest.current
    getTicket(initialTicketId).then((ticket) => { if (active && sequence === selectionRequest.current) setSelected(ticket) })
      .catch((err) => { if (active) setActionError(err instanceof Error ? err.message : 'Could not open ticket') })
    return () => { active = false }
  }, [initialTicketId])

  const selectedId = selected?.id
  useEffect(() => {
    if (!selectedId || sending || statusBusy) return
    let active = true
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      getTicket(selectedId).then((ticket) => { if (active) setSelected(ticket) })
        .catch(() => { if (active) setActionError('Could not refresh this conversation. Your draft is safe.') })
    }, 20000)
    return () => { active = false; window.clearInterval(timer) }
  }, [selectedId, sending, statusBusy])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  // KPIs derived from the loaded page (honest, no fabricated platform-wide numbers).
  const pageStats = useMemo(() => {
    return {
      slaBreached: tickets.filter((t) => t.sla_breached).length,
      highPriority: tickets.filter((t) => t.priority === "high" || t.priority === "urgent").length,
      open: tickets.filter((t) => t.status === "open").length,
      pending: tickets.filter((t) => t.status === "pending").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
    }
  }, [tickets])

  async function openTicket(id: string) {
    if (sending || statusBusy) return
    const request = ++selectionRequest.current
    setDetailLoading(true)
    setReplyText("")
    setActionError(null)
    try {
      const detail = await getTicket(id)
      if (request === selectionRequest.current) setSelected(detail)
    } catch (err) {
      if (request === selectionRequest.current) setActionError(err instanceof Error ? err.message : 'Could not open this ticket.')
    } finally {
      if (request === selectionRequest.current) setDetailLoading(false)
    }
  }

  async function sendReply() {
    if (!selected || !replyText.trim() || sending || !canRespond) return
    setSending(true)
    setActionError(null)
    try {
      const body = replyText.trim()
      if (replyAttempt.current?.ticket !== selected.id || replyAttempt.current?.body !== body) {
        replyAttempt.current = {ticket: selected.id, body, id: crypto.randomUUID()}
      }
      const updated = await respondTicket(selected.id, { body, client_message_id: replyAttempt.current.id })
      setSelected(updated)
      setReplyText("")
      replyAttempt.current = null
      await fetchTickets()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Reply failed. Your draft is safe; retry to send.')
    } finally {
      setSending(false)
    }
  }

  async function changeStatus(next: SupportTicketStatus) {
    if (!selected || statusBusy || !canRespond) return
    setStatusBusy(true)
    setActionError(null)
    try {
      const updated = await updateTicketStatus(selected.id, { status: next })
      setSelected(updated)
      await fetchTickets()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not change ticket status.')
    } finally {
      setStatusBusy(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-[1600px] mx-auto overflow-hidden">
      {/* LEFT PANE: Ticket List */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${selected ? "max-w-[60%]" : "max-w-full"}`}>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            {canEditHelp && <Link href="/support/settings" className="rounded-lg border px-3 py-2 text-sm text-emerald-700">Edit app support page</Link>}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support Hub</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Unified triage for Users, Merchants, and Disputes · {total.toLocaleString()} total
              </p>
            </div>
          </div>

          {actionError && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{actionError}</div>}

          {/* KPI Header — derived from the current page */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "Total Tickets", val: total.toLocaleString(), icon: MessageSquare, color: "text-blue-600" },
              { label: "SLA Breaches", val: pageStats.slaBreached.toString(), icon: ShieldAlert, color: "text-red-600" },
              { label: "High Priority", val: pageStats.highPriority.toString(), icon: AlertTriangle, color: "text-amber-600" },
              { label: "Open", val: pageStats.open.toString(), icon: MessageSquare, color: "text-blue-600" },
              { label: "Pending", val: pageStats.pending.toString(), icon: Clock, color: "text-slate-600" },
              { label: "Resolved", val: pageStats.resolved.toString(), icon: CheckCircle2, color: "text-emerald-600" },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{k.label}</div>
                  <div className={`text-2xl font-black ${k.color}`}>{k.val}</div>
                </div>
                <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center shrink-0">
                  <k.icon className={`h-4 w-4 ${k.color}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Filters + Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/50">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search ticket subject…"
                  className="pl-9 bg-white border-slate-200 text-sm h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1) } }}>
                <SelectTrigger className="w-[150px] h-10 text-sm font-medium"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={(v) => { if (v) { setPriority(v); setPage(1) } }}>
                <SelectTrigger className="w-[150px] h-10 text-sm font-medium"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={requesterType} onValueChange={(v) => { if (v) { setRequesterType(v); setPage(1) } }}>
                <SelectTrigger className="w-[150px] h-10 text-sm font-medium"><SelectValue placeholder="Requester" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requesters</SelectItem>
                  <SelectItem value="consumer">Consumer</SelectItem>
                  <SelectItem value="merchant">Merchant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error ? (
              <div className="p-6 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>
            ) : null}

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Loading tickets…</span>
              </div>
            ) : tickets.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No tickets found"
                description="No support tickets match your current filters."
                actionLabel="Clear Search"
                onAction={() => { setSearch(""); setStatus("all"); setPriority("all"); setRequesterType("all") }}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-600">Ticket</TableHead>
                      <TableHead className="font-semibold text-slate-600">Requester</TableHead>
                      <TableHead className="font-semibold text-slate-600">Status &amp; Priority</TableHead>
                      <TableHead className="font-semibold text-slate-600 text-right">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        onClick={() => openTicket(ticket.id)}
                        className={`cursor-pointer transition-colors ${selected?.id === ticket.id ? "bg-indigo-50/50 hover:bg-indigo-50/80" : "hover:bg-slate-50"}`}
                      >
                        <TableCell>
                          <div className="font-bold text-slate-900 text-sm">{ticket.subject}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              {ticket.id.slice(0, 8)}
                            </span>
                            {ticket.sla_breached ? (
                              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border-rose-200 inline-flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3" /> SLA Breach
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 capitalize">
                            {ticket.requester_type === "merchant" ? (
                              <Store className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <User className="h-3.5 w-3.5 text-indigo-500" />
                            )}
                            {ticket.requester_type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 items-start">
                            <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider capitalize ${statusBadge[ticket.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                              {ticket.status}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider capitalize ${priorityBadge[ticket.priority] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                              {ticket.priority}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-xs font-medium text-slate-500">{timeAgo(ticket.created_at)}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!loading && tickets.length > 0 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
                <span>Page {page} of {totalPages} · {total.toLocaleString()} tickets</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">&lt;</button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">&gt;</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Ticket Detail */}
      {selected && (
        <div className="w-[40%] h-full border-l border-slate-200 bg-white flex flex-col shadow-2xl animate-in slide-in-from-right-8 duration-300 z-10 shrink-0">
          <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">#{selected.reference}</span>
                <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider capitalize ${statusBadge[selected.status] ?? "bg-slate-100 text-slate-600"}`}>{selected.status}</Badge>
                {selected.sla_breached ? (
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border-rose-200">SLA Breach</Badge>
                ) : null}
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{selected.subject}</h2>
              {selected.lead_id && <p className="mt-2 break-all text-xs text-slate-500">Order reference: {selected.lead_id}</p>}
              {selected.session_id && <p className="mt-2 break-all text-xs text-slate-500">AI session: {selected.session_id}</p>}
              <div className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2 capitalize">
                {selected.requester_type} · <span className="font-semibold text-slate-700 capitalize">{selected.priority} priority</span>
                <span>•</span> Opened {timeAgo(selected.created_at)}
              </div>
            </div>
            <button disabled={sending || statusBusy} onClick={() => { selectionRequest.current++; setSelected(null) }} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Message history */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {detailLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">Loading…</span>
              </div>
            ) : selected.messages.length === 0 ? (
              <div className="text-center text-sm text-slate-400 py-10">No messages yet.</div>
            ) : (
              selected.messages.map((msg) => {
                const isAdmin = msg.author_type === "admin"
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[85%] ${isAdmin ? "ml-auto items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1.5 mx-1">
                      <span className="text-xs font-bold text-slate-500 capitalize">{msg.author_type}</span>
                      <span className="text-[10px] font-medium text-slate-400">{timeAgo(msg.created_at)}</span>
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${isAdmin ? "bg-indigo-600 text-white rounded-tr-sm shadow-sm" : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"}`}>
                      <span className="whitespace-pre-wrap break-words">{msg.body}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Action area */}
          <div className="p-6 border-t border-slate-200 bg-white">
            <div className="flex gap-2 mb-4">
              <Select value={selected.status} onValueChange={(v) => changeStatus(v as SupportTicketStatus)}>
                <SelectTrigger className="h-9 text-sm font-medium flex-1" disabled={statusBusy || sending || !canRespond}>
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={() => changeStatus("resolved")}
                disabled={statusBusy || sending || !canRespond || selected.status === "resolved"}
                className="inline-flex h-9 items-center gap-1.5 px-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-colors border border-emerald-200 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" /> Mark Resolved
              </button>
            </div>

            <div className="relative border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all shadow-sm">
              <textarea
                rows={4}
                maxLength={4000}
                disabled={sending || !canRespond}
                className="w-full text-sm p-4 outline-none resize-none placeholder:text-slate-400 bg-slate-50/50 leading-relaxed"
                placeholder="Type your reply here…"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex items-center justify-end p-3 bg-white border-t border-slate-100">
                <button
                  onClick={sendReply}
                  disabled={sending || statusBusy || !canRespond || !replyText.trim()}
                  className="inline-flex h-9 items-center gap-2 px-6 rounded-md bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
