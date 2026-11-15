import Button from './Button';
import Modal from './Modal';
import { TriangleAlert } from 'lucide-react';
import { useLanguage } from '../../i18n/index.jsx';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel, danger = true, dark = true, loading = false, children }) {
  const { t } = useLanguage();
  return (
    <Modal open={open} onClose={onClose} title={title || t('common.confirm')} size="sm" dark={dark}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl shrink-0 ${danger ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
          <TriangleAlert size={22} aria-hidden="true" />
        </div>
        <div className="text-sm leading-6 opacity-90">
          {message && <p>{message}</p>}
          {children}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant={dark ? 'secondary-dark' : 'secondary'} onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel || t('common.confirm')}</Button>
      </div>
    </Modal>
  );
}
