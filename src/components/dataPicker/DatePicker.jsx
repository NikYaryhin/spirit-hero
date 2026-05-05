import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const WEEKDAYS = ["Mo","Tu","We","Th","Fr","Sa","Su"];

function formatDate(d) {
  if (!d) return "";
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
}

function sameDay(a, b) {
  return a && b &&
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();
}

export default function DatePicker({ value, onChange, label = "Date" }) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("days"); // "days" | "months" | "years"
  const [viewDate, setViewDate] = useState(value || new Date());
  const ref = useRef(null);
  const triggerRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openPicker() {
    const rect = triggerRef.current.getBoundingClientRect();

    setCoords({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
    setViewDate(value || new Date());
    setView("days");
    setOpen(!open);
  }

  function selectDay(day) {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange?.(d);
    setOpen(false);
  }

  function selectMonth(month) {
    setViewDate(new Date(viewDate.getFullYear(), month, 1));
    setView("days");
  }

  function selectYear(year) {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setView("months");
  }

  function navigate(dir) {
    const vd = viewDate;
    if (view === "days")
      setViewDate(new Date(vd.getFullYear(), vd.getMonth() + dir, 1));
    else if (view === "months")
      setViewDate(new Date(vd.getFullYear() + dir, vd.getMonth(), 1));
    else
      setViewDate(new Date(vd.getFullYear() + dir * 10, vd.getMonth(), 1));
  }

  function renderDays() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDow = new Date(year, month, 1).getDay() || 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const cells = [];
    for (let i = firstDow - 1; i > 0; i--)
      cells.push(<button key={`p${i}`} className="dp-day dp-day--other" disabled>{prevDays - i + 1}</button>);

    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(year, month, d);
      const isToday = sameDay(thisDate, today);
      const isSelected = sameDay(thisDate, value);
      cells.push(
        <button
          key={d}
          onClick={() => selectDay(d)}
          className={["dp-day", isToday && "dp-day--today", isSelected && "dp-day--selected"].filter(Boolean).join(" ")}
        >{d}</button>
      );
    }

    const total = (firstDow - 1) + daysInMonth;
    const rem = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let d = 1; d <= rem; d++)
      cells.push(<button key={`n${d}`} className="dp-day dp-day--other" disabled>{d}</button>);

    return (
      <div className="dp-grid">
        <div className="dp-weekdays">{WEEKDAYS.map(w => <div key={w} className="dp-wd">{w}</div>)}</div>
        <div className="dp-days">{cells}</div>
      </div>
    );
  }

  function renderMonths() {
    const selMonth = value ? value.getMonth() : -1;
    return (
      <div className="dp-months">
        {MONTHS.map((m, i) => (
          <button key={m} onClick={() => selectMonth(i)}
            className={["dp-month-btn", i === selMonth && "dp-month-btn--sel"].filter(Boolean).join(" ")}
          >{m}</button>
        ))}
      </div>
    );
  }

  function renderYears() {
    const base = viewDate.getFullYear();
    const selYear = value ? value.getFullYear() : -1;
    const years = Array.from({ length: 25 }, (_, i) => base - 12 + i);
    return (
      <div className="dp-years">
        {years.map(y => (
          <button key={y} onClick={() => selectYear(y)}
            className={["dp-year-btn", y === selYear && "dp-year-btn--sel"].filter(Boolean).join(" ")}
          >{y}</button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ }} ref={ref}>
      <style>{`
        .dp-trigger {
          display: flex; align-items: center; gap: 10px;
          padding: 18px; border: 1px solid #4E008E;
          border-radius: 8px; background: #fff; cursor: pointer;
          font-size: 15px; color: #111; min-width: 240px; height: 52px;
          transition: border-color .15s; position: relative;
        }
        .dp-trigger:hover { border-color: #9ca3af; }
        .dp-trigger--has-value { border-color: #4E008E }
        .dp-floating-label {
          position: absolute; left: 42px; top: 50%; transform: translateY(-50%);
          font-size: 15px; color: #9ca3af; pointer-events: none;
          transition: top .15s, font-size .15s, color .15s, transform .15s;
        }
        .dp-floating-label--up {
          top: 10px; transform: translateY(0);
          font-size: 11px; color: #185FA5; font-weight: 500;
        }
        .dp-calendar {
           position: absolute;
  top: 0;
  left: 0;
  transform: translateX(-10%); z-index: 9999;
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 12px; overflow: hidden; width: 340px;
          box-shadow: 0 4px 20px rgba(0,0,0,.08);
        }
        .dp-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border-bottom: 1px solid #f3f4f6;
        }
        .dp-nav {
          background: none; border: 1px solid #e5e7eb; border-radius: 6px;
          width: 32px; height: 32px; cursor: pointer; display: flex;
          align-items: center; justify-content: center; color: #6b7280; transition: background .12s;
        }
        .dp-nav:hover { background: #f9fafb; }
        .dp-month-year-btn {
          background: none; border: none; font-size: 15px; font-weight: 500;
          cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: background .12s;
        }
        .dp-month-year-btn:hover { background: #f3f4f6; }
        .dp-grid { padding: 12px 16px 16px; }
        .dp-weekdays { display: grid; grid-template-columns: repeat(7,1fr); margin-bottom: 4px; }
        .dp-wd { text-align: center; font-size: 11px; color: #9ca3af; font-weight: 500; padding: 4px 0; }
        .dp-days { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }
        .dp-day {
          aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
          font-size: 14px; border-radius: 50%; cursor: pointer; background: none;
          border: none; color: #111; transition: background .1s;
        }
        .dp-day:hover:not(:disabled) { background: #f3f4f6; }
        .dp-day:disabled { color: #d1d5db; cursor: default; }
        .dp-day--today { font-weight: 600; color: #4E008E; }
        .dp-day--selected { background: #4E008E !important; color: #fff !important; font-weight: 600; }
        .dp-months { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; padding: 14px; }
        .dp-month-btn {
          padding: 10px 4px; text-align: center; font-size: 13px;
          border-radius: 6px; cursor: pointer; border: none; background: none;
          color: #111; transition: background .12s;
        }
        .dp-month-btn:hover { background: #f3f4f6; }
        .dp-month-btn--sel { background: #4E008E !important; color: #fff !important; }
        .dp-years { display: grid; grid-template-columns: repeat(4,1fr); gap: 4px; padding: 14px; max-height: 220px; overflow-y: auto; }
        .dp-year-btn {
          padding: 8px 4px; text-align: center; font-size: 13px;
          border-radius: 6px; cursor: pointer; border: none; background: none;
          color: #111; transition: background .12s;
        }
        .dp-year-btn:hover { background: #f3f4f6; }
        .dp-year-btn--sel { background: #4E008E !important; color: #fff !important; }
        .dp-footer {
          padding: 10px 16px; border-top: 1px solid #f3f4f6;
          display: flex; gap: 8px; justify-content: flex-end;
        }
        .dp-btn {
          padding: 6px 14px; border-radius: 6px; font-size: 13px;
          cursor: pointer; font-weight: 500; transition: background .12s;
        }
        .dp-btn-clear { background: none; border: 1px solid #e5e7eb; color: #6b7280; }
        .dp-btn-clear:hover { background: #f9fafb; }
        .dp-btn-today { background: none; border: 1px solid #4E008E; color: #4E008E; }
        .dp-btn-today:hover { background: #c3abd0; }
      `}</style>

      <div style={{ position: "relative" }}>
        <button   ref={triggerRef}
                  className={`dp-trigger${value ? " dp-trigger--has-value" : ""}`} onClick={openPicker}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          <span style={{ flex: 1, textAlign: "left" }}>
            {value ? formatDate(value) : label}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        {/*<span className={`dp-floating-label${value ? " dp-floating-label--up" : ""}`}>
          {value ? "Selected date" : '' }
        </span>*/}
      </div>

      {open && (

        <div className="dp-calendar" style={{
          top: coords.top,
          left: coords.left,
        }}>
          <div className="dp-header">
            <button className="dp-nav" onClick={() => navigate(-1)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div style={{ display: "flex", gap: 4 }}>
              <button className="dp-month-year-btn" onClick={() => setView(v => v === "months" ? "days" : "months")}>
                {MONTHS[viewDate.getMonth()]}
              </button>
              <button className="dp-month-year-btn" onClick={() => setView(v => v === "years" ? "days" : "years")}>
                {viewDate.getFullYear()}
              </button>
            </div>
            <button className="dp-nav" onClick={() => navigate(1)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          {view === "days" && renderDays()}
          {view === "months" && renderMonths()}
          {view === "years" && renderYears()}

          <div className="dp-footer">
            <button className="dp-btn dp-btn-clear" onClick={() => { onChange?.(null); setOpen(false); }}>Clear</button>
            <button className="dp-btn dp-btn-today" onClick={() => { onChange?.(new Date(today)); setOpen(false); }}>Today</button>
          </div>
        </div>
      )}
    </div>
  );
}
