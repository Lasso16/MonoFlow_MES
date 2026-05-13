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

export let apiToken: string | null = null;

export const setApiToken = (token: string) => {
  apiToken = token;
};

export type PagedResponse<T> = {
  items: T[];
  totalRecords?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
};

export type ApiPagedResponse<T> = {
  Items?: T[];
  TotalRecords?: number;
  PageNumber?: number;
  PageSize?: number;
  TotalPages?: number;
  items?: T[];
  totalRecords?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
};

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

export const normalizePagedResult = <T>(payload: any): PagedResult<T> => {
  const data = payload?.value ?? payload; 

  return {
    Items: data?.items ?? data?.Items ?? data?.$values ?? [],
    TotalRecords: Number(data?.totalRecords ?? data?.TotalRecords ?? 0),
    PageNumber: Number(data?.pageNumber ?? data?.PageNumber ?? 1),
    PageSize: Number(data?.pageSize ?? data?.PageSize ?? 20),
  };
};

export const handleResponse = async <T>(response: Response): Promise<Result<T>> => {
  if (response.ok) {
    if (response.status === 204) return Result.success({} as T);
    try {
      const json = await response.json();
    
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
      ...(apiToken && { Authorization: `Bearer ${apiToken}` }),
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

export const getAllPagedAggregateList = async <T>(url: string): Promise<Result<T[]>> => {
  try {
    const pageSize = 1000;
    const firstPageResponse = await fetchData(url, Method.GET);
    const firstPageResult = await handleResponse<PagedResponse<T>>(firstPageResponse);

    if (firstPageResult.isFailure) {
      return Result.failure<T[]>(firstPageResult.error as string | ProblemDetails);
    }

    const firstPage = firstPageResult.value;

    if (!firstPage || !Array.isArray(firstPage.items)) {
      return Result.success(
        Array.isArray(firstPage as unknown as T[]) ? (firstPage as unknown as T[]) : [],
      );
    }

    const items = [...firstPage.items];
    const totalPages = firstPage.totalPages ?? 1;

    for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
      const pageResponse = await fetchData(
        `${url}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        Method.GET,
      );
      const pageResult = await handleResponse<PagedResponse<T>>(pageResponse);

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
