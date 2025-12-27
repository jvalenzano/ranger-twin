/**
 * ADK SSE Client
 *
 * Low-level client for connecting to ADK's /run_sse endpoint.
 * Handles SSE parsing and event streaming from the RANGER orchestrator.
 *
 * Based on: Implementation Guide Section 3 (SSE Client Implementation)
 * Reference: AlfaBlok/adk-sse-testing pattern
 */

/**
 * ADK Content format for messages
 * ADK expects messages in this structured format, not plain strings.
 */
export interface ADKMessageContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface ADKRequest {
  app_name: string;
  user_id: string;
  session_id: string;
  new_message: ADKMessageContent;
  state?: Record<string, unknown>;
}

/**
 * Input format for streamADK function
 * Accepts plain string for convenience, converts to ADK Content internally.
 */
export interface ADKStreamInput {
  session_id: string;
  new_message: string;
  state?: Record<string, unknown>;
}

export interface ADKEventPart {
  text?: string;
  thought?: boolean;
  code_execution_result?: {
    output: string;
    outcome: string;
  };
}

export interface ADKEventContent {
  parts: ADKEventPart[];
  role?: string;
}

export interface ADKToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface ADKActions {
  tool_call?: ADKToolCall;
  state_delta?: Record<string, unknown>;
}

/**
 * Raw ADK SSE Event structure
 * Based on ADK's native event format documented in the implementation guide.
 */
export interface ADKEvent {
  id: string;
  invocationId?: string; // Optional: May be undefined in heartbeats/system events
  author?: string; // Optional: May be undefined in some event types
  content?: ADKEventContent;
  actions?: ADKActions;
  partial: boolean;
  timestamp?: number;
  error_code?: string;
  error_message?: string;
}

export type ADKEventCallback = (event: ADKEvent) => void;
export type ADKErrorCallback = (error: Error) => void;

/**
 * Configuration for the ADK client
 */
export interface ADKClientConfig {
  baseUrl: string;
  appName?: string;
  userId?: string;
  onEvent?: ADKEventCallback;
  onError?: ADKErrorCallback;
  onComplete?: () => void;
}

/**
 * Parse SSE data line into ADK event
 */
function parseSSEData(line: string): ADKEvent | null {
  if (!line.startsWith('data: ')) {
    return null;
  }

  const data = line.slice(6); // Remove 'data: ' prefix

  // Skip [DONE] marker
  if (data === '[DONE]') {
    return null;
  }

  try {
    return JSON.parse(data) as ADKEvent;
  } catch (e) {
    console.warn('Failed to parse SSE data:', data, e);
    return null;
  }
}

/**
 * Stream agent responses from ADK's /run_sse endpoint
 *
 * @param config - Client configuration
 * @param request - The request to send
 * @returns AbortController to cancel the stream
 */
export async function streamADK(
  config: ADKClientConfig,
  request: ADKStreamInput
): Promise<AbortController> {
  const controller = new AbortController();

  // Convert string message to ADK Content format
  const fullRequest: ADKRequest = {
    app_name: config.appName || 'ranger',
    user_id: config.userId || 'usfs-demo',
    session_id: request.session_id,
    new_message: {
      role: 'user',
      parts: [{ text: request.new_message }],
    },
    state: request.state,
  };

  try {
    const response = await fetch(`${config.baseUrl}/run_sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(fullRequest),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    // Process the stream
    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            config.onComplete?.();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Split by newlines and process complete lines
          const lines = buffer.split('\n');
          buffer = lines[lines.length - 1] || ''; // Keep incomplete line in buffer

          for (const line of lines.slice(0, -1)) {
            if (line.trim() === '') continue;

            const event = parseSSEData(line);
            if (event) {
              config.onEvent?.(event);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Stream was cancelled, not an error
          return;
        }
        config.onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    };

    // Start processing without blocking
    processStream();

    return controller;
  } catch (error) {
    config.onError?.(error instanceof Error ? error : new Error(String(error)));
    return controller;
  }
}

/**
 * Extract structured data from an ADK event's content
 *
 * Tool outputs are serialized as JSON strings within content.parts[0].text
 * This function attempts to parse that JSON.
 */
export function extractToolData(event: ADKEvent): Record<string, unknown> | null {
  const text = event.content?.parts?.[0]?.text;
  if (!text) return null;

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Check if an event is retryable based on error code
 */
export function isRetryableError(event: ADKEvent): boolean {
  const retryableCodes = [
    'RESOURCE_EXHAUSTED',
    'DEADLINE_EXCEEDED',
    'UNAVAILABLE',
  ];
  return event.error_code ? retryableCodes.includes(event.error_code) : false;
}

/**
 * Check if an event represents a terminal error
 */
export function isTerminalError(event: ADKEvent): boolean {
  const terminalCodes = ['BLOCKLIST', 'INVALID_ARGUMENT', 'PERMISSION_DENIED'];
  return event.error_code ? terminalCodes.includes(event.error_code) : false;
}
