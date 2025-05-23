import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer,
  type Method
} from 'axios';
import { stringify } from 'qs';
import { useAuthStore } from '@/stores/auth.store';
import localStorageService from '@/utils/localStorageService';
import { t } from '@/plugins/i18n';
import { message } from 'ant-design-vue';


interface HttpClientRequestConfig extends AxiosRequestConfig {
  url: string;
}

type RequestMethods = Extract<
  Method,
  'get' | 'post' | 'put' | 'delete' | 'patch' | 'option' | 'head'
>;

const defaultConfig: AxiosRequestConfig = {
  // timeout: 20000,
  headers: {
    scheme: 'http',
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Access-Control-Allow-Origin': '*'
  },
  baseURL: import.meta.env.VUE_APP_DOMAIN_API,
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  },
  withCredentials: false
};

class HttpClient {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  private static requests: Function[] = [];
  // private static isRefreshing = false;
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);
  private static readonly whiteList: string[] = ['/token', '/login'];

  private httpInterceptorsRequest(): void {
    HttpClient.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorageService.getAccessToken() || "ABC";
        config.headers['x-access-token'] = `${token}`;
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  private httpInterceptorsResponse(): void {
    HttpClient.axiosInstance.interceptors.response.use(
      (response) => {
        return response.data;
      },
      async (error) => {
        const { response, config } = error;
        if(error && error.code === 'ERR_NETWORK') {
          message.error('Network disconnect!');
          return Promise.reject(error);
        } else {
          const $error = error;
          $error.isCancelRequest = Axios.isCancel($error);
          return Promise.reject($error);
        }
      }
    );
  }
  private subscribeTokenRefresh(cb: Function) {
    HttpClient.requests.push(cb);
  }

  private onRefreshed(token: string) {
    HttpClient.requests.map((cb) => cb(token));
    HttpClient.requests = [];
  }

  // private getNewToken() {
  //   useAuthStore()
  //     .handleRefreshToken()
  //     .then(({ token }) => {
  //       this.onRefreshed(token);
  //     })
  //     .catch(() => {
  //       HttpClient.requests = [];
  //       window.location.href = '/login';
  //     })
  //     .finally(() => {
  //       HttpClient.isRefreshing = false;
  //     });
  // }

  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig | FormData,
    axiosConfig?: HttpClientRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as HttpClientRequestConfig;

    return HttpClient.axiosInstance.request(config);
  }

  public post<T>(url: string, params?: AxiosRequestConfig, config?: HttpClientRequestConfig) {
    return this.request<T>('post', url, params, config);
  }

  public get<T>(url: string, params?: AxiosRequestConfig, config?: HttpClientRequestConfig) {
    return this.request<T>('get', url, params, config);
  }

  public upload<T>(url: string, params?: AxiosRequestConfig | FormData) {
    const uploadConfig: HttpClientRequestConfig = {
      url: url,
      timeout: 60000 * 15,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    return this.request<T>('post', url, params, uploadConfig);
  }

}

export const http = new HttpClient();
