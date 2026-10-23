"use client";

import { useResponsive } from "@/hooks/useResponsive";
import { Creator, CreatorCategory, exploreAPI } from "@/lib/api/explore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useExploreModel() {
  const router = useRouter();

  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Real API state
  const [categories, setCategories] = useState<CreatorCategory[]>([]);

  const [newCreators, setNewCreators] = useState<Creator[]>([]);

  const [creatorsData, setCreatorsData] = useState<{
    [key: string]: Creator[];
  }>({});

  const [loading, setLoading] = useState(true);

  const [loadingMore, setLoadingMore] = useState<{ [key: string]: boolean }>(
    {},
  );

  const [cursors, setCursors] = useState<{ [key: string]: string | undefined }>(
    {},
  );

  const [hasMore, setHasMore] = useState<{ [key: string]: boolean }>({});

  const [displayCounts, setDisplayCounts] = useState<{ [key: string]: number }>(
    {},
  );

  const [expandedBios, setExpandedBios] = useState<{ [key: string]: boolean }>(
    {},
  );

  const [activeFilter, setActiveFilter] = useState("모든 카테고리");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log("Fetching explore data...");

        // Fetch categories and new creators in parallel
        const [categoriesData, newCreatorsData] = await Promise.all([
          exploreAPI.getCategories(),
          exploreAPI.getNewCreators(20),
        ]);

        console.log("Categories loaded:", categoriesData);
        console.log("New creators loaded:", newCreatorsData);

        setCategories(categoriesData);
        setNewCreators(newCreatorsData.creators);

        // Initialize state for each category
        const initialDisplayCounts: { [key: string]: number } = {};
        const initialHasMore: { [key: string]: boolean } = {};
        const initialCursors: { [key: string]: string | undefined } = {};
        const initialCreatorsData: { [key: string]: Creator[] } = {};

        categoriesData.forEach((category) => {
          initialDisplayCounts[category.name] = 6;
          initialHasMore[category.name] = true;
          initialCursors[category.name] = undefined;
          initialCreatorsData[category.name] = [];
        });

        setDisplayCounts(initialDisplayCounts);
        setHasMore(initialHasMore);
        setCursors(initialCursors);
        setCreatorsData(initialCreatorsData);
      } catch (error) {
        console.error("Failed to fetch explore data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}만`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}천`;
    }
    return num.toString();
  };

  // Function to load creators for a specific category
  const loadCategoryCreators = async (categoryName: string) => {
    const category = categories.find((cat) => cat.name === categoryName);
    if (!category) {
      console.log(`Category not found: ${categoryName}`);
      return;
    }

    console.log(
      `Loading creators for category: ${categoryName} (ID: ${category.id})`,
    );

    try {
      const response = await exploreAPI.getCreatorsByCategory(
        category.id,
        displayCounts[categoryName] || 6,
        cursors[categoryName],
      );

      console.log(`API response for ${categoryName}:`, response);

      setCreatorsData((prev) => ({
        ...prev,
        [categoryName]: response.creators,
      }));

      setHasMore((prev) => ({
        ...prev,
        [categoryName]: response.hasMore,
      }));

      setCursors((prev) => ({
        ...prev,
        [categoryName]: response.nextCursor,
      }));
    } catch (error) {
      console.error(`Failed to load creators for ${categoryName}:`, error);
      // Set empty array to prevent infinite retry
      setCreatorsData((prev) => ({
        ...prev,
        [categoryName]: [],
      }));
      setHasMore((prev) => ({
        ...prev,
        [categoryName]: false,
      }));
    }
  };

  const handleLoadMore = async (categoryName: string) => {
    if (loadingMore[categoryName]) return;

    setLoadingMore((prev) => ({
      ...prev,
      [categoryName]: true,
    }));

    try {
      const category = categories.find((cat) => cat.name === categoryName);
      if (!category) return;

      const response = await exploreAPI.getCreatorsByCategory(
        category.id,
        6, // Load 6 more
        cursors[categoryName],
      );

      setCreatorsData((prev) => ({
        ...prev,
        [categoryName]: [...(prev[categoryName] || []), ...response.creators],
      }));

      setDisplayCounts((prev) => ({
        ...prev,
        [categoryName]: (prev[categoryName] || 0) + 6,
      }));

      setHasMore((prev) => ({
        ...prev,
        [categoryName]: response.hasMore,
      }));

      setCursors((prev) => ({
        ...prev,
        [categoryName]: response.nextCursor,
      }));
    } catch (error) {
      console.error(`Failed to load more creators for ${categoryName}:`, error);
    } finally {
      setLoadingMore((prev) => ({
        ...prev,
        [categoryName]: false,
      }));
    }
  };

  const toggleBioExpansion = (creatorId: string) => {
    setExpandedBios((prev) => ({
      ...prev,
      [creatorId]: !prev[creatorId],
    }));
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // Load category data when filter changes to a specific category
  useEffect(() => {
    console.log(`Filter changed to: ${activeFilter}`);
    console.log(
      `Categories available:`,
      categories.map((cat) => cat.name),
    );
    console.log(`Current creators data:`, creatorsData);

    if (activeFilter === "모든 카테고리" && categories.length > 0) {
      // Load data for all categories when "모든 카테고리" is selected
      categories.forEach((category) => {
        if (!creatorsData[category.name]?.length) {
          console.log(`Loading data for category: ${category.name}`);
          loadCategoryCreators(category.name);
        }
      });
    } else if (activeFilter !== "신규" && categories.length > 0) {
      const category = categories.find((cat) => cat.name === activeFilter);
      if (category && !creatorsData[activeFilter]?.length) {
        console.log(`Triggering API call for category: ${activeFilter}`);
        loadCategoryCreators(activeFilter);
      } else if (category && creatorsData[activeFilter]?.length) {
        console.log(
          `Category ${activeFilter} already has data:`,
          creatorsData[activeFilter],
        );
      } else if (!category) {
        console.log(`Category ${activeFilter} not found in categories list`);
      }
    }
  }, [activeFilter, categories]);

  const getDisplayCreators = (categoryName: string) => {
    return creatorsData[categoryName] || [];
  };

  const hasMoreCreators = (categoryName: string) => {
    return hasMore[categoryName] || false;
  };

  return {
    router,
    isMobile,
    isTablet,
    categories,
    newCreators,
    loading,
    loadingMore,
    activeFilter,
    formatNumber,
    handleLoadMore,
    handleFilterChange,
    getDisplayCreators,
    hasMoreCreators,
  };
}
