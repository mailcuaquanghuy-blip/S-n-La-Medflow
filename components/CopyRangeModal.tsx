
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Calendar, X, Copy, Info, CheckCircle2 } from 'lucide-react';
import { DateInput } from './DateInput';
import { Appointment, Procedure } from '../types';

interface CopyRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startDate: string, endDate: string, selectedApptIds?: string[]) => void;
  sourceDate: string;
  title?: string;
  subtitle?: string;
  infoText?: string;
  patientName?: string;
  procedureCount?: number;
  itemLabel?: string;
  appointmentsToCopy?: Appointment[];
  procedures?: Procedure[];
}

export const CopyRangeModal: React.FC<CopyRangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sourceDate,
  title = "Sao chép lịch trình",
  subtitle = "Giai đoạn điều trị mới",
  infoText = "Hệ thống sẽ tự động quét nhân sự thay thế nếu nhân sự cũ nghỉ trong các ngày được chọn. Khung giờ và máy thực hiện sẽ được ưu tiên giữ nguyên.",
  patientName,
  procedureCount,
  itemLabel = "Bệnh nhân",
  appointmentsToCopy = [],
  procedures = []
}) => {
  const [startDate, setStartDate] = useState(new Date(sourceDate).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const nextDay = new Date(sourceDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  });
  const [selectedApptIds, setSelectedApptIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedApptIds(appointmentsToCopy.map(a => a.id));
      setStartDate(new Date(sourceDate).toISOString().split('T')[0]);
      const nextDay = new Date(sourceDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setEndDate(nextDay.toISOString().split('T')[0]);
    }
  }, [isOpen, sourceDate, appointmentsToCopy]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(startDate) > new Date(endDate)) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }
    if (appointmentsToCopy.length > 0 && selectedApptIds.length === 0) {
      alert("Vui lòng chọn ít nhất một thủ thuật để sao chép.");
      return;
    }
    onConfirm(startDate, endDate, appointmentsToCopy.length > 0 ? selectedApptIds : undefined);
  };

  const getProcedureName = (procId: string) => {
    return procedures.find(p => p.id === procId)?.name || 'Thủ thuật';
  };

  const toggleApptSelection = (id: string) => {
    setSelectedApptIds(prev => 
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
                <Copy size={20} />
            </div>
            <div>
                <h3 className="font-black uppercase tracking-tight text-lg">{title}</h3>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            {patientName && <p className="text-xs text-slate-500 font-bold">{itemLabel}: <span className="text-slate-800">{patientName}</span></p>}
            <p className="text-xs text-slate-500 font-bold">Nguồn: <span className="text-indigo-600">Ngày {new Date(sourceDate).toLocaleDateString('vi-VN')}</span> {procedureCount !== undefined && `(${procedureCount} mục)`}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar size={12} /> Từ ngày
              </label>
              <DateInput 
                className="w-full p-3 border-2 border-slate-100 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all z-50"
                value={startDate}
                onChange={val => setStartDate(val)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar size={12} /> Đến ngày
              </label>
              <DateInput 
                className="w-full p-3 border-2 border-slate-100 rounded-xl font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all z-50"
                value={endDate}
                onChange={val => setEndDate(val)}
              />
            </div>
          </div>

          {appointmentsToCopy.length > 0 && (
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chọn thủ thuật để sao chép</label>
               <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                 {appointmentsToCopy.map(appt => (
                   <label key={appt.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                     <input 
                       type="checkbox" 
                       checked={selectedApptIds.includes(appt.id)}
                       onChange={() => toggleApptSelection(appt.id)}
                       className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                     />
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-slate-800 truncate">{getProcedureName(appt.procedureId)}</p>
                       <p className="text-xs text-slate-500">{appt.startTime} - {appt.endTime}</p>
                     </div>
                   </label>
                 ))}
               </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
             <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
             <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
               {infoText}
             </p>
          </div>

          <div className="pt-2 flex gap-3 shrink-0">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 h-12 rounded-xl">HỦY</Button>
            <Button type="submit" className="flex-[2] h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                THỰC HIỆN COPY
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
