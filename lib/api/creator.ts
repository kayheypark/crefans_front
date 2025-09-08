import axios from "axios";
import { getApiUrl } from "@/utils/env";

export const creatorAPI = {
  onboardCreator: async () => {
    const response = await axios.post(
      `${getApiUrl()}/creator/onboard`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },
};
