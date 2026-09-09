import { getApiUrl } from "@/utils/env";
import axios from "axios";

export const apiClient = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
});
