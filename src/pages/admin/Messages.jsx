import { useMemo, useState } from 'react';
import { Search, Mail, MailOpen, Archive, Trash2, Inbox } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';
import { useToast } from '../../contexts/ToastContext';
import { storageAdapter } from '../../storage/storageAdapter';
import { Tabs, EmptyState } from '../../components/common/Feedback';
import PageHeader from '../../components/common/PageHeader';
import { Input } from '../../components/common/FormControls';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDateTime } from '../../utils/format';

export default function Messages() {
  const { t, locale } = useLanguage();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((v) => v + 1);

  const all = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = storageAdapter.getCollection('messages').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (tab !== 'all') list = list.filter((m) => m.status === tab);
    if (q) list = list.filter((m) => [m.name, m.email, m.subject, m.message].join(' ').toLowerCase().includes(q));
    return list;
  }, [query, tab, tick]);
  const counts = useMemo(() => {
    const list = storageAdapter.getCollection('messages');
    return { all: list.length, open: list.filter((m) => m.status === 'open').length, read: list.filter((m) => m.status === 'read').length, archived: list.filter((m) => m.status === 'archived').length };
  }, [tick]);

  const setStatus = (id, status) => {
    storageAdapter.updateInCollection('messages', id, { status });
    toast.success(t('admin.messageUpdated'));
    refresh();
  };
  const doDelete = () => { storageAdapter.removeFromCollection('messages', (m) => m.id === confirmDelete.id); toast.success(t('admin.messageDeleted')); setConfirmDelete(null); refresh(); };

  const tabs = [
    { key: 'all', label: t('admin.allMessages'), count: counts.all },
    { key: 'open', label: t('admin.unreadMessages'), count: counts.open },
    { key: 'read', label: t('admin.readMessages'), count: counts.read },
    { key: 'archived', label: t('admin.archivedMessages'), count: counts.archived },
  ];

  return (
    <div>
      <PageHeader title={t('admin.messagesTitle')} subtitle={t('admin.messagesSubtitle')} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <div className="md:w-72"><Input dark icon={Search} placeholder={t('admin.searchMessages')} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t('common.search')} /></div>
      </div>

      {all.length === 0 ? <EmptyState icon={Inbox} title={t('common.noData')} /> : (
        <ul className="space-y-2 max-w-4xl">
          {all.map((m) => (
            <li key={m.id} className={`rounded-2xl border p-4 flex flex-wrap items-start gap-3 ${m.status === 'open' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#1c2941] bg-[#151F32]'} ${m.status === 'archived' ? 'opacity-70' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-black text-slate-100">{m.subject}</p>{m.status === 'open' && <span className="w-2 h-2 rounded-full bg-emerald-400" aria-label={t('status.unread')} />}</div>
                <p className="text-[10px] text-slate-500 mt-0.5">{m.name} · <span dir="ltr">{m.email}</span> · {formatDateTime(m.createdAt, locale)}</p>
                <p className="text-[11px] text-slate-300 leading-6 mt-2 whitespace-pre-line">{m.message}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {m.status === 'open'
                  ? <button className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10" onClick={() => setStatus(m.id, 'read')} aria-label={t('admin.markAsRead')} title={t('admin.markAsRead')}><MailOpen size={16} /></button>
                  : <button className="p-2 rounded-lg text-slate-500 hover:text-slate-100 hover:bg-[#1B2740]" onClick={() => setStatus(m.id, 'open')} aria-label={t('admin.markAsUnread')} title={t('admin.markAsUnread')}><Mail size={16} /></button>}
                {m.status !== 'archived' && <button className="p-2 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10" onClick={() => setStatus(m.id, 'archived')} aria-label={t('admin.archiveMessage')} title={t('admin.archiveMessage')}><Archive size={16} /></button>}
                <button className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => setConfirmDelete(m)} aria-label={t('admin.deleteMessage')}><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={doDelete} title={t('admin.messagesTitle')} message={confirmDelete?.subject} confirmLabel={t('common.delete')} danger />
    </div>
  );
}
