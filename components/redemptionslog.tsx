"use client";

import { useEffect, useState } from "react";

interface Redemption {
  id: string;
  rewardName: string;
  date: string;
  couponCode: string;
}

export function Redemption() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);

  useEffect(() => {
    // Mock data จำลองประวัติแลกของ
    setRedemptions([
      {
        id: "1",
        rewardName: "กล่องดินสอลายการ์ตูน",
        date: "2025-07-10",
        couponCode: "U001R0031007",
      },
      {
        id: "2",
        rewardName: "หนังสือภาพระบายสี",
        date: "2025-07-05",
        couponCode: "U001R0070507",
      },
    ]);
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">ประวัติการแลกของ</h2>
      <div className="space-y-4">
        {redemptions.map((item) => (
          <div
            key={item.id}
            className="border border-gray-300 rounded-lg p-4 bg-white shadow"
          >
            <div className="font-semibold text-lg">{item.rewardName}</div>
            <div className="text-sm text-gray-600">วันที่แลก: {item.date}</div>
            <div className="text-sm">
              โค้ดคูปอง: <span className="font-mono">{item.couponCode}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
