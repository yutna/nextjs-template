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
      year: "numeric",
      weekday: "long",
    },
    // format.dateTime(date, "shortDateTime") → "25/2/2569 09:30"
    shortDateTime: {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    },
    // format.dateTime(date, "mediumDateTime") → "25 ก.พ. 2569 09:30"
    mediumDateTime: {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    },
    // format.dateTime(date, "time") → "09:30"
    time: {
      hour: "numeric",
      minute: "numeric",
    },
  },
  number: {
    // format.number(1234.5, "decimal") → "1,234.50"
    decimal: {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    // format.number(1234.5, "integer") → "1,235"
    integer: {
      style: "decimal",
      maximumFractionDigits: 0,
    },
    // format.number(1234.5, "currency") → "฿1,234.50"
    currency: {
      style: "currency",
      currency: "THB",
    },
    // format.number(0.856, "percent") → "85.6%"
    percent: {
      style: "percent",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  },
  list: {
    // format.list(["แอปเปิล", "กล้วย", "ส้ม"], "enumeration") → "แอปเปิล กล้วย และส้ม"
    enumeration: {
      style: "long",
      type: "conjunction",
    },
  },
};
