import axios from 'axios';
import { API_URLS } from '../constants/constants';
import type { Article, AuthorStat, Credentials, Message, ParsedMetadata, User } from '../constants/types';
import {
  MessageSchema,
  DeletedArticlesSchema,
  DeletedEntitiesSchema,
  EntitySchema,
  EntitiesSchema,
  AuthorStatSchema,
  ArticleSchema,
  ArticlesSchema,
  ArticleWithContent,
  ParsedMetadataSchema,
} from '../constants/schema';
import { getCookie, normalizeEntityNames } from '../helpers/helpers';
import { ZodType, ZodError } from 'zod';
import type { infer as ZodInfer } from 'zod';

const apiClient = axios.create();

apiClient.defaults.withCredentials = true;

apiClient.interceptors.request.use((config) => {
  const csrf_access_token = getCookie('csrf_access_token');
  if (csrf_access_token) {
    config.headers['X-CSRF-TOKEN'] = csrf_access_token;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authUrls = [API_URLS.LOGIN, API_URLS.REGISTER, API_URLS.REFRESH];
    if (error.response?.status !== 401 || originalRequest._retry || authUrls.includes(originalRequest.url)) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    await authApi.refresh();
    return apiClient(originalRequest);
  },
);

export const healthApi = {
  status: async (): Promise<Message> => {
    const { data } = await axios.get(API_URLS.HEALTH);
    const result = parseWithError(MessageSchema, data);
    return result;
  },
};

export const authApi = {
  register: async (credentials: Credentials): Promise<Message> => {
    const { data } = await apiClient.post(API_URLS.REGISTER, credentials);
    const result = parseWithError(MessageSchema, data);
    return result;
  },
  login: async (credentials: Credentials): Promise<Message> => {
    const { data } = await apiClient.post(API_URLS.LOGIN, credentials);
    const result = parseWithError(MessageSchema, data);
    return result;
  },
  refresh: async (): Promise<Message> => {
    const csrf_refresh_token = getCookie('csrf_refresh_token');

    if (!csrf_refresh_token) {
      throw new Error('Missing refresh CSRF cookie');
    }

    const axiosClient = axios.create();
    axiosClient.defaults.withCredentials = true;
    const { data } = await axiosClient.post(
      API_URLS.REFRESH,
      {},
      {
        headers: {
          'X-CSRF-TOKEN': csrf_refresh_token,
        },
      },
    );
    const result = parseWithError(MessageSchema, data);
    return result;
  },
  session: async (): Promise<User> => {
    const { data } = await apiClient.get(API_URLS.SESSION);
    const result = parseWithError(EntitySchema, data);
    return result;
  },
  logout: async (): Promise<Message> => {
    const { data } = await apiClient.post(API_URLS.LOGOUT);
    const result = parseWithError(MessageSchema, data);
    return result;
  },
};

const parseWithError = <TSchema extends ZodType>(schema: TSchema, data: unknown): ZodInfer<TSchema> => {
  try {
    const response = schema.parse(data);
    return response;
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.error(`Invalid API response`, error);
      throw new Error(`Invalid API response. Please try again later.`, { cause: error });
    }
    throw error;
  }
};

export const articlesApi = {
  list: async (): Promise<Article[]> => {
    const { data } = await apiClient.get(API_URLS.ARTICLES);
    const response = parseWithError(ArticlesSchema, data);
    const sorted_res = response.sort((a, b) => b.date_modification.localeCompare(a.date_modification));
    return sorted_res;
  },
  get: async (id: number): Promise<Article> => {
    const { data } = await apiClient.get(`${API_URLS.ARTICLES}/${id}`);
    const response = parseWithError(ArticleWithContent, data);
    return response;
  },
  create: async (article: Article): Promise<Article> => {
    const { data } = await apiClient.post(API_URLS.ARTICLES, article);
    const response = parseWithError(ArticleSchema, data);
    return response;
  },
  update: async (article: Article): Promise<Article> => {
    const { data } = await apiClient.put(API_URLS.ARTICLES, article);
    const response = parseWithError(ArticleSchema, data);
    return response;
  },
  remove: async (ids: number[]): Promise<number> => {
    const { data } = await apiClient.delete(API_URLS.ARTICLES, {
      data: { ids },
    });
    const response = parseWithError(DeletedArticlesSchema, data);
    return response.count;
  },
  parse: async (url: string): Promise<ParsedMetadata> => {
    const { data } = await apiClient.post(API_URLS.PARSE, {
      name: url,
    });
    const response = parseWithError(ParsedMetadataSchema, data);
    return response;
  },
};

export const authorsApi = {
  list: async (): Promise<string[]> => {
    const { data } = await apiClient.get(API_URLS.AUTHORS);
    const response = parseWithError(EntitiesSchema, data);
    return normalizeEntityNames(response);
  },
  list_top: async (): Promise<AuthorStat[]> => {
    const { data } = await apiClient.get(API_URLS.TOP_AUTHORS);
    const response = parseWithError(AuthorStatSchema, data);
    return response;
  },
  create: async (author: string): Promise<string> => {
    const { data } = await apiClient.post(API_URLS.AUTHORS, author);
    const response = parseWithError(EntitySchema, data);
    return response.name;
  },
  update: async (author: string): Promise<string> => {
    const { data } = await apiClient.put(API_URLS.AUTHORS, author);
    const response = parseWithError(EntitySchema, data);
    return response.name;
  },
  remove: async (ids: number[]): Promise<number> => {
    const { data } = await apiClient.delete(API_URLS.AUTHORS, {
      data: { ids },
    });
    const response = parseWithError(DeletedEntitiesSchema, data);
    return response.count;
  },
};

export const tagsApi = {
  list: async (): Promise<string[]> => {
    const { data } = await apiClient.get(API_URLS.TAGS);
    const response = parseWithError(EntitiesSchema, data);
    return normalizeEntityNames(response);
  },
  create: async (tag: string): Promise<string> => {
    const { data } = await apiClient.post(API_URLS.TAGS, tag);
    const response = parseWithError(EntitySchema, data);
    return response.name;
  },
  update: async (tag: string): Promise<string> => {
    const { data } = await apiClient.put(API_URLS.TAGS, tag);
    const response = parseWithError(EntitySchema, data);
    return response.name;
  },
  remove: async (ids: number[]): Promise<number> => {
    const { data } = await apiClient.delete(API_URLS.TAGS, {
      data: { ids },
    });
    const response = parseWithError(DeletedEntitiesSchema, data);
    return response.count;
  },
};
