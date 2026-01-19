/**
 * URL validation utility for image URLs
 */

export interface ImageUrlValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates if a URL string is a valid URL format
 * Note: We don't strictly validate image extensions since many CDNs/hosting services
 * use URLs without file extensions. The backend can validate the actual image format.
 * @param url - The URL string to validate
 * @returns Validation result with valid flag and optional error message
 */
export function validateImageUrl(url: string): ImageUrlValidationResult {
  // Empty URL is allowed (avatar is optional)
  if (!url || url.trim() === '') {
    return { valid: true };
  }

  try {
    // Validate URL format (must be a valid HTTP/HTTPS URL)
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { 
        valid: false, 
        error: 'URL must use HTTP or HTTPS protocol' 
      };
    }
    
    // Basic validation - URL format is correct
    // We don't validate file extensions here because many image hosting services
    // use URLs without file extensions
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}
