import { Result } from "../model/Result";
import { type PagedResult } from "../model/PagedResult";
import { type AppError, type ProblemDetails } from "../model/aggregates/ProblemDetails";

export const API_URL = import.meta.env.VITE_API_URL ?? import.meta.env.NEXT_PUBLIC_API_URL;
const COMMUNICATION_ERROR = "ERROR: API COMMUNICATION FAILED";

const Method = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;

export const mapHttpError = (status: number): string => {
  if (status === 400) return "Solicitud invalida. Revisa los datos enviados.";
  if (status === 404) return "Recurso no encontrado.";
  if (status >= 500) return "Error interno del servidor. Intenta mas tarde.";
  return "Error HTTP al consumir el endpoint.";
};

export const normalizeProblemDetails = (
  status: number,
  payload?: Partial<ProblemDetails>,
): AppError => {
  const fallback = mapHttpError(status);
  const message =
    (typeof payload?.message === "string" && payload.message) ||
    (typeof payload?.error === "string" && payload.error) ||
    payload?.detail ||
    payload?.title ||
    fallback;

  return {
    status,
    message,
    title: payload?.title ?? fallback,
    detail: payload?.detail ?? message,
    type: payload?.type,
    instance: payload?.instance,
    details: payload?.errors,
    ...payload,
  };
};

type BackendResultWrapper = { isSuccess: boolean; value?: unknown; error?: string | null };

const isBackendResultWrapper = (json: unknown): json is BackendResultWrapper => {
  return (
    typeof json === "object" &&
    json !== null &&
    "isSuccess" in json &&
    typeof (json as { isSuccess: unknown }).isSuccess === "boolean" &&
    "value" in json
  );
};

export const handleResponse = async <T>(response: Response): Promise<Result<T>> => {
  if (response.ok) {
    if (response.status === 204) return Result.success({} as T);
    try {
      const json = await response.json();

      if (isBackendResultWrapper(json)) {
        if (json.isSuccess) {
          return Result.success((json.value ?? {}) as T);
        }
        return Result.failure(
          normalizeProblemDetails(response.status, { detail: json.error ?? "Error del servidor." }),
        );
      }

      return Result.success(json as T);
    } catch (e) {
      return Result.success({} as T);
    }
  }

  try {
    const problem = (await response.json()) as Partial<ProblemDetails>;
    return Result.failure(normalizeProblemDetails(response.status, problem));
  } catch {
    const text = await response.text();
    return Result.failure(normalizeProblemDetails(response.status, { detail: text }));
  }
};

export const fetchData = async (
  url: string,
  method: (typeof Method)[keyof typeof Method],
  body?: string | null,
): Promise<Response> => {
  return await fetch(url, {
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    method,
    body: body || undefined,
  });
};

export const getAggregateList = async <T>(url: string): Promise<Result<T>> => {
  try {
    const response = await fetchData(url, Method.GET);
    return await handleResponse<T>(response);
  } catch {
    return Result.failure({ status: 0, message: COMMUNICATION_ERROR, title: COMMUNICATION_ERROR, detail: COMMUNICATION_ERROR });
  }
};

const withPageParams = (url: string, pageNumber: number, pageSize: number): string => {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}pageNumber=${pageNumber}&pageSize=${pageSize}`;
};

export const getAllPagedAggregateList = async <T>(url: string): Promise<Result<T[]>> => {
  try {
    const pageSize = 1000;
    const firstPageUrl = withPageParams(url, 1, pageSize);
    const firstPageResponse = await fetchData(firstPageUrl, Method.GET);
    const firstPageResult = await handleResponse<PagedResult<T>>(firstPageResponse);

    if (firstPageResult.isFailure) {
      return Result.failure<T[]>(firstPageResult.error as string | ProblemDetails);
    }

    const firstPage = firstPageResult.value;

    if (!firstPage || !Array.isArray(firstPage.items)) {
      return Result.success(
        Array.isArray(firstPage as unknown as T[]) ? (firstPage as unknown as T[]) : [],
      );
    }

    const totalPages = firstPage.totalPages ?? 1;

    if (totalPages <= 1) {
      return Result.success([...firstPage.items]);
    }

    const remainingPages = Array.from({ length: totalPages - 1 }, (_, index) => index + 2);
    const responses = await Promise.all(
      remainingPages.map((pageNumber) =>
        fetchData(withPageParams(url, pageNumber, pageSize), Method.GET).then((response) =>
          handleResponse<PagedResult<T>>(response),
        ),
      ),
    );

    const items = [...firstPage.items];
    for (const pageResult of responses) {
      if (pageResult.isFailure) {
        return Result.failure<T[]>(pageResult.error as string | ProblemDetails);
      }
      const page = pageResult.value;
      if (page?.items?.length) {
        items.push(...page.items);
      }
    }

    return Result.success(items);
  } catch {
    return Result.failure({ status: 0, message: COMMUNICATION_ERROR, title: COMMUNICATION_ERROR, detail: COMMUNICATION_ERROR });
  }
};

export const getAggregateItem = async <T>(url: string, id: string): Promise<Result<T>> => {
  try {
    const response = await fetchData(`${url}/${id}`, Method.GET);
    return await handleResponse<T>(response);
  } catch {
    return Result.failure({ status: 0, message: COMMUNICATION_ERROR, title: COMMUNICATION_ERROR, detail: COMMUNICATION_ERROR });
  }
};

export const postAggregateItem = async <T>(url: string, body: string): Promise<Result<T>> => {
  try {
    const response = await fetchData(url, Method.POST, body);
    return await handleResponse<T>(response);
  } catch {
    return Result.failure({ status: 0, message: COMMUNICATION_ERROR, title: COMMUNICATION_ERROR, detail: COMMUNICATION_ERROR });
  }
};

export const postAggregate = async <T>(url: string, payload: unknown): Promise<Result<T>> => {
  return await postAggregateItem<T>(url, JSON.stringify(payload));
};

export const putAggregateItem = async <T>(
  url: string,
  id: string,
  body: string,
): Promise<Result<T>> => {
  try {
    const finalUrl = id ? `${url}/${id}` : url;
    const response = await fetchData(finalUrl, Method.PUT, body);
    return await handleResponse<T>(response);
  } catch {
    return Result.failure({ status: 0, message: COMMUNICATION_ERROR, title: COMMUNICATION_ERROR, detail: COMMUNICATION_ERROR });
  }
};

export const deleteAggregateItem = async (url: string, id: string): Promise<Result<void>> => {
  try {
    const response = await fetchData(`${url}/${id}`, Method.DELETE);
    return await handleResponse<void>(response);
  } catch {
    return Result.failure({ status: 0, message: COMMUNICATION_ERROR, title: COMMUNICATION_ERROR, detail: COMMUNICATION_ERROR });
  }
};
