import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const manilaDateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const storageTimestampPattern = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;

const padTwoDigits = (value: number) => String(value).padStart(2, "0");

const formatDisplayTimestamp = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number
) => {
  const meridiem = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${padTwoDigits(month)}/${padTwoDigits(day)}/${year}, ${padTwoDigits(hour12)}:${padTwoDigits(minute)}:${padTwoDigits(second)} ${meridiem}`;
};

export function createManilaTimestampValue(date = new Date()) {
  const parts = Object.fromEntries(
    manilaDateTimeFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

export function formatStoredTimestamp(value: string) {
  const trimmedValue = value.trim();
  const matchedTimestamp = trimmedValue.match(storageTimestampPattern);

  if (matchedTimestamp) {
    const [, year, month, day, hour = "00", minute = "00", second = "00"] = matchedTimestamp;

    return formatDisplayTimestamp(
      Number(year),
      Number(month),
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }

  const parsedDate = new Date(trimmedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return formatDisplayTimestamp(
    parsedDate.getFullYear(),
    parsedDate.getMonth() + 1,
    parsedDate.getDate(),
    parsedDate.getHours(),
    parsedDate.getMinutes(),
    parsedDate.getSeconds()
  );
}

// Custom hook to get current user full name or username from localStorage
import { useState, useEffect } from "react";
export function useCurrentUser() {
  const [username, setUsername] = useState<string>("User");
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const fullName = [parsedUser?.FirstName, parsedUser?.LastName]
          .filter((part) => !!part)
          .join(" ");
        if (fullName) {
          setUsername(fullName);
        } else if (parsedUser?.UserName) {
          setUsername(parsedUser.UserName);
        }
      } catch (err) {
        // fallback to default
      }
    }
  }, []);
  return username;
}
