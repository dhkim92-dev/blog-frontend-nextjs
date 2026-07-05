export type ApiEnvelope<TPayload> = {
  status: number;
  code: string;
  message?: string | null;
  payload: TPayload;
};

export async function parseApiEnvelope<TPayload>(response: Response) {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as ApiEnvelope<TPayload>;
  } catch {
    return null;
  }
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
