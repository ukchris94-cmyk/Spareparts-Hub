"import { clsx } from \"clsx\";
import { twMerge } from \"tailwind-merge\";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text, maxLength = 50) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  paid: 'bg-green-500/10 text-green-500 border-green-500/20',
  assigned: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  picked_up: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  in_transit: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export const PART_CATEGORIES = [
  'Engine Parts',
  'Brakes',
  'Suspension',
  'Electrical',
  'Transmission',
  'Exhaust',
  'Cooling System',
  'Fuel System',
  'Body Parts',
  'Interior',
  'Accessories',
  'Filters',
  'Belts & Hoses',
  'Steering',
  'Wheels & Tires',
];
