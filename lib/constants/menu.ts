import {
  HomeOutlined,
  CompassOutlined,
  BellOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const menuItems = [
  {
    key: "feed",
    icon: HomeOutlined,
    label: "피드",
    path: "/feed",
  },
  {
    key: "explore",
    icon: CompassOutlined,
    label: "탐색",
    path: "/explore",
  },
  {
    key: "notifications",
    icon: BellOutlined,
    label: "알림",
    path: "/notifications",
  },
  {
    key: "profile",
    icon: UserOutlined,
    label: "프로필",
    path: "/profile",
  },
];
