/**
 * @author: Erick Hernández Silva (erick@yungle.com.mx)
 * @created: 01/01/2025
 * @updated: 01/01/2025       
 * @file fileUpload.ts
 */

// Main path for the API
export const API_PATH: string =
  "https://1rozp64iaj.execute-api.us-east-1.amazonaws.com/preproduction";

export function buildApiUrl(path: string): string {
  return `${API_PATH}${path}`;
}

export const API_KEY: string = "ZfQ7BY7pbwAQGGq5FAON6AxLWfwMl729Qp3W5Fq6";

export function toHex(input: string | string[]): string | string[] {
  console.log(input);
  const encoder = new TextEncoder();
  const encodeToHex = (str: string) => 
    Array.from(encoder.encode(str))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');

  if (typeof input === 'string') {
    return encodeToHex(input);
  } else {
    return input.map(encodeToHex);
  }
}

export function base64ToHex(str: string): string {
  const raw = atob(str);
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const hex = raw.charCodeAt(i).toString(16);
    result += (hex.length === 2 ? hex : '0' + hex);
  }
  return result.toUpperCase();
}

export const ENVIRONMENT: 'preproduction' | 'production' = process.env.ENVIRONMENT as 'preproduction' | 'production' || 'preproduction';