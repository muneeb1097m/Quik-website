import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with tailwind-merge to handle conflicts correctly.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Efficiently serializes data to be passed to Client Components.
 * This replaces the expensive JSON.parse(JSON.stringify(data)) pattern.
 * It primarily handles converting Date objects to ISO strings or preserving them if possible,
 * but for Next.js Client props, simple JSON cloning is often what's needed to strip non-serializables.
 * However, a custom traverser is better if we only need to specific fields, but strictly 
 * for "JSON-serializable" check, the native JSON methods are robust if slow.
 * 
 * Ideally, we should manually map DTOs, but for speed, we'll implement a slightly
 * lighter deep clone if needed, OR just wrap the JSON hack in a typed helper 
 * if we can't easily refactor everything to DTOs right now.
 * 
 * Given the current usage, let's keep it simple wrapper first to centralize it.
 */
export function serialize<T>(data: T): T {
    if (data === undefined || data === null) return data;
    // For now, centralizing this allows us to swap implementation later.
    return JSON.parse(JSON.stringify(data));
}

/**
 * Removes HTML tags from a string.
 */
export function stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '');
}
