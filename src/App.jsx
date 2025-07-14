import React, { useState, useEffect, useRef } from "react";

// API URL (ใช้ค่าจริง)
const API_URL =
  "https://family.bare.live/api/family/GetBannedVBInFamily?dateStart=2025-07-01&dateEnd=2025-07-31&family_uuid=84edecb8-5e73-4d65-b3f3-8fd8968c7ce3";

// ตัว modal แสดงรายละเอียด
function BanDetailsModal({ open, item, onClose }) {
  if (!open || !item) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
        <button
          className="absolute top-2 right-3 text-xl text-red-500 hover:text-red-700"
          onClick={onClose}
          title="ปิด"
        >
          ×
        </button>
        <h3 className="text-lg font-bold mb-3 text-indigo-600">
          รายละเอียดการแบน
        </h3>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="font-medium pr-2 py-1">VibieID</td>
              <td>{item.u1_vibie_id}</td>
            </tr>
            <tr>
              <td className="font-medium pr-2 py-1">เหตุผล</td>
              <td>{item.reason}</td>
            </tr>
            <tr>
              <td className="font-medium pr-2 py-1">วันที่แบน</td>
              <td>
                {item.ban_date
                  ? new Date(item.ban_date).toLocaleDateString("th-TH")
                  : "-"}
              </td>
            </tr>
            <tr>
              <td className="font-medium pr-2 py-1">row_number</td>
              <td>{item.row_number}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ฟอร์มค้นหา VibieID
function SearchVibie({ banData }) {
  const [searchId, setSearchId] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    setError("");
    setResults([]);
    if (!/^[A-Z0-9]{6}$/i.test(searchId)) {
      setError("กรุณากรอก VibieID 6 หลัก (ตัวเลขหรือตัวอักษร)");
      return;
    }
    const found = banData.filter(
      (item) =>
        (item.u1_vibie_id || "").toUpperCase() === searchId.trim().toUpperCase()
    );
    if (found.length === 0) setError("ไม่พบข้อมูล VibieID นี้");
    setResults(found);
  };

  return (
    <section className="mb-6">
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap gap-2 items-center"
        autoComplete="off"
      >
        <input
          className="flex-1 min-w-[160px] p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-indigo-200"
          type="text"
          maxLength={6}
          placeholder="VibieID 6 หลัก"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button
          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
          type="submit"
        >
          ค้นหา
        </button>
      </form>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {results.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-indigo-700 mb-2">ผลการค้นหา</h4>
          <table className="w-full border-collapse text-sm shadow rounded">
            <thead>
              <tr className="bg-indigo-50">
                <th className="border px-2 py-1">VibieID</th>
                <th className="border px-2 py-1">เหตุผล</th>
                <th className="border px-2 py-1">วันที่แบน</th>
                <th className="border px-2 py-1">row</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => (
                <tr key={item.row_number} className="bg-white">
                  <td className="border px-2 py-1">{item.u1_vibie_id}</td>
                  <td className="border px-2 py-1">{item.reason}</td>
                  <td className="border px-2 py-1">
                    {item.ban_date
                      ? new Date(item.ban_date).toLocaleDateString("th-TH")
                      : "-"}
                  </td>
                  <td className="border px-2 py-1">{item.row_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// แจ้งเตือนเมื่อ row_number:1 เปลี่ยน
function RowOneNotifier({ banData }) {
  const prevRowOne = useRef();
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    const rowOne = banData?.find?.((d) => d.row_number === 1);
    if (!rowOne) return;
    if (
      prevRowOne.current &&
      JSON.stringify(prevRowOne.current) !== JSON.stringify(rowOne)
    ) {
      new Notification("แจ้งเตือนรายการแบนใหม่ (row 1)", {
        body: `ID: ${rowOne.u1_vibie_id} เหตุผล: ${rowOne.reason}`,
      });
    }
    prevRowOne.current = rowOne;
  }, [banData]);
  return null;
}

// ตารางรายการแบน
function BanTable({ data, onSelect }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-600">ไม่มีข้อมูลแบนในเดือนนี้</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[420px] w-full border-collapse shadow rounded-lg bg-white">
        <thead>
          <tr className="bg-indigo-100 text-indigo-800">
            <th className="border px-2 py-2 font-medium">#</th>
            <th className="border px-2 py-2 font-medium">VibieID</th>
            <th className="border px-2 py-2 font-medium">เหตุผล</th>
            <th className="border px-2 py-2 font-medium">วันที่แบน</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr
              key={item.row_number}
              className="hover:bg-indigo-50 cursor-pointer transition"
              onClick={() => onSelect(item)}
            >
              <td className="border px-2 py-1 text-center">{i + 1}</td>
              <td className="border px-2 py-1 text-center font-mono">{item.u1_vibie_id}</td>
              <td className="border px-2 py-1">{item.reason}</td>
              <td className="border px-2 py-1 text-center">
                {item.ban_date
                  ? new Date(item.ban_date).toLocaleDateString("th-TH")
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-gray-400 mt-2">
        * แตะที่แถวเพื่อดูรายละเอียด
      </div>
    </div>
  );
}

export default function App() {
  const [banData, setBanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // โหลดข้อมูล & Poll
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        return res.json();
      })
      .then((json) => {
        if (!alive) return;
        setBanData(json.data || []);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [refreshKey]);

  // Poll ทุก 60 วินาที
  useEffect(() => {
    const timer = setInterval(() => setRefreshKey((k) => k + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-2 sm:p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl p-5 sm:p-8 mt-4 mb-8">
        <header className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-700 mb-2 tracking-tight">
            ระบบตรวจสอบรายการแบน (VB Family)
          </h1>
          <p className="text-gray-500 text-sm">
            ข้อมูลภายในเดือน กรกฎาคม 2568
          </p>
        </header>
        <SearchVibie banData={banData} />
        <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
          <h2 className="font-semibold text-indigo-700">
            รายการแบนในเดือนนี้
          </h2>
          <button
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            รีเฟรชข้อมูล
          </button>
        </div>
        {loading && (
          <div className="py-6 text-center text-indigo-500 animate-pulse">
            กำลังโหลดข้อมูล...
          </div>
        )}
        {error && (
          <div className="py-6 text-center text-red-600">{error}</div>
        )}
        {!loading && !error && (
          <BanTable data={banData} onSelect={setSelected} />
        )}
        <RowOneNotifier banData={banData} />
        <BanDetailsModal
          open={!!selected}
          item={selected}
          onClose={() => setSelected(null)}
        />
      </div>
      <footer className="text-xs text-gray-500 text-center mb-4">
        © {new Date().getFullYear()} VB Family | Powered by React + Tailwind CSS
      </footer>
    </div>
  );
}
