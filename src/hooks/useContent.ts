/**
 * TanStack Query hooks for HavFun's Firestore content.
 * Content changes rarely, so we cache aggressively. The pricing hook falls back
 * to the bundled PRICING_CONFIG so price math works instantly on first paint.
 */
import { useQuery } from '@tanstack/react-query';
import {
  fetchAttractions,
  fetchCafe,
  fetchCafeImages,
  fetchFaqs,
  fetchGallery,
  fetchPricing,
  fetchSafetyFeatures,
  fetchSite,
  fetchWaiverImages,
  type PricingConfig,
  DEFAULT_SITE_SETTINGS,
} from '@/lib/content';
import { PRICING_CONFIG } from '@/lib/pricing-config';

const ONE_HOUR = 1000 * 60 * 60;

export const useSite = () =>
  useQuery({
    queryKey: ['site'],
    queryFn: fetchSite,
    placeholderData: DEFAULT_SITE_SETTINGS,
    staleTime: ONE_HOUR,
  });

export const usePricing = () =>
  useQuery<PricingConfig>({
    queryKey: ['pricing'],
    queryFn: async () => (await fetchPricing()) ?? (PRICING_CONFIG as PricingConfig),
    placeholderData: PRICING_CONFIG as PricingConfig,
    staleTime: ONE_HOUR,
  });

export const useAttractions = () =>
  useQuery({ queryKey: ['attractions'], queryFn: fetchAttractions, staleTime: ONE_HOUR });

export const useSafetyFeatures = () =>
  useQuery({ queryKey: ['safetyFeatures'], queryFn: fetchSafetyFeatures, staleTime: ONE_HOUR });

export const useFaqs = () =>
  useQuery({ queryKey: ['faqs'], queryFn: fetchFaqs, staleTime: ONE_HOUR });

export const useGallery = () =>
  useQuery({ queryKey: ['gallery'], queryFn: fetchGallery, staleTime: ONE_HOUR });

export const useCafe = () =>
  useQuery({ queryKey: ['cafe'], queryFn: fetchCafe, staleTime: ONE_HOUR });

export const useCafeImages = () =>
  useQuery({ queryKey: ['cafeImages'], queryFn: fetchCafeImages, staleTime: ONE_HOUR });

export const useWaiverImages = () =>
  useQuery({ queryKey: ['waiverImages'], queryFn: fetchWaiverImages, staleTime: ONE_HOUR });
