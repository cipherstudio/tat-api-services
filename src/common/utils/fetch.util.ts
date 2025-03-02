export class FetchUtil {
  /**
   * Make a GET request
   * @param url URL to fetch
   * @param options Fetch options
   */
  static async get<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Fetch GET failed: ${error.message}`);
      }
      throw new Error('Fetch GET failed with unknown error');
    }
  }

  /**
   * Make a POST request
   * @param url URL to fetch
   * @param data Data to send
   * @param options Fetch options
   */
  static async post<T, D = unknown>(
    url: string,
    data: D,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Fetch POST failed: ${error.message}`);
      }
      throw new Error('Fetch POST failed with unknown error');
    }
  }

  /**
   * Make a request with streaming response
   * @param url URL to fetch
   * @param options Fetch options
   */
  static async stream(
    url: string,
    options: RequestInit = {},
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      const response = await fetch(url, {
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response has no body!');
      }

      return response.body;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Fetch stream failed: ${error.message}`);
      }
      throw new Error('Fetch stream failed with unknown error');
    }
  }

  /**
   * Make a request with abort signal
   * @param url URL to fetch
   * @param timeoutMs Timeout in milliseconds
   * @param options Fetch options
   */
  static async withTimeout<T>(
    url: string,
    timeoutMs: number,
    options: RequestInit = {},
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Fetch with timeout failed: ${error.message}`);
      }
      throw new Error('Fetch with timeout failed with unknown error');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
