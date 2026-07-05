"use client";

function handleSessionExpired(response: Response) {
  if (response.headers.get("x-session-expired") !== "true") {
    return;
  }

  window.alert("세션이 만료되었습니다.");
  window.location.replace("/login");
}

export async function browserAuthFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const response = await fetch(input, init);

  handleSessionExpired(response);

  return response;
}
