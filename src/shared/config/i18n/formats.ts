import type { Formats } from "next-intl";

export const formats: Formats = {
  dateTime: {
    // format.dateTime(date, "short") → "25/2/2569"
    short: {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    },
    // format.dateTime(date, "medium") → "25 ก.พ. 2569"
    medium: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
    // format.dateTime(date, "long") → "25 กุมภาพันธ์ 2569"
    long: {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
    // format.dateTime(date, "full") → "วันพุธที่ 25 กุมภาพันธ์ 2569"
    full: {
      day: "numeric",
      month: "long",
      weekday: "long",
      year: "numeric",
    },
    // format.dateTime(date, "shortDateTime") → "25/2/2569 09:30"
    shortDateTime: {
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      month: "numeric",
      year: "numeric",
    },
    // format.dateTime(date, "mediumDateTime") → "25 ก.พ. 2569 09:30"
    mediumDateTime: {
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      month: "short",
      year: "numeric",
    },
    // format.dateTime(date, "time") → "09:30"
    time: {
      hour: "numeric",
      minute: "numeric",
    },
  },
  list: {
    // format.list(["แอปเปิล", "กล้วย", "ส้ม"], "enumeration") → "แอปเปิล กล้วย และส้ม"
    enumeration: {
      style: "long",
      type: "conjunction",
    },
  },
  number: {
    // format.number(1234.5, "decimal") → "1,234.50"
    decimal: {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: "decimal",
    },
    // format.number(1234.5, "integer") → "1,235"
    integer: {
      maximumFractionDigits: 0,
      style: "decimal",
    },
    // format.number(1234.5, "currency") → "฿1,234.50"
    currency: {
      currency: "THB",
      style: "currency",
    },
    // format.number(0.856, "percent") → "85.6%"
    percent: {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
      style: "percent",
    },
  },
};
