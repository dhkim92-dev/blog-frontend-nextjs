export type ApiEnvelope<TPayload> = {
  status: number;
  code: string;
  message?: string | null;
  payload: TPayload;
};

export function parseApiEnvelopeText<TPayload>(responseText: string) {
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as ApiEnvelope<TPayload>;
  } catch {
    return null;
  }
}

export async function parseApiEnvelope<TPayload>(response: Response) {
  return parseApiEnvelopeText<TPayload>(await response.text());
}

export function getApiPayload<TPayload>(
  responseBody: ApiEnvelope<TPayload> | null,
) {
  return responseBody?.payload ?? null;
}

export function getApiMessage(
  responseBody: Pick<ApiEnvelope<unknown>, "message"> | null,
) {
  return responseBody?.message ?? "";
}
