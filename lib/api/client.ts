import axios from "axios";
import { getApiUrl } from "@/utils/env";

export const apiClient = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
});