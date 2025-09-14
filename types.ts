
export interface OriginalImage {
  dataUrl: string;
  file: File;
}

export interface EditedImage {
  dataUrl: string;
  text: string;
}

export interface StyleReference {
  dataUrl: string;
  file: File;
}

export interface AiStyle {
  id: string;
  name:string;
  prompt: string;
  imageUrl: string;
}

export interface HistoryState {
  id: string;
  images: EditedImage[];
  prompt: string;
  negativePrompt: string;
}

export type AppMode = 'image' | 'video';

export type ActiveTool = 'mask' | 'magic' | 'expand' | 'erase' | 'cutout' | null;

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface VideoOperation {
    name?: string;
    done?: boolean;
    response?: {
        generatedVideos?: {
            video?: {
                uri?: string;
            }
        }[]
    }
}

export type VideoGenerationStatus = 'idle' | 'generating' | 'done' | 'error';

export interface VideoGenerationState {
    status: VideoGenerationStatus;
    message: string;
}

// --- NEW USER & SUBSCRIPTION TYPES ---

export interface AuthUser {
    id: string;
    email: string;
    passwordHash: string;
}

export type UserPlan = 'free' | 'pro';

export interface UserState {
    plan: UserPlan;
    credits: number;
    lastCreditReset: number; // Timestamp
    rewardedAdsWatchedToday: number;
    lastAdReset: number; // Timestamp
    usageLog: UsageRecord[];
    isAdmin: boolean;
}

export type TrackableFeatures = 
    | 'image_generation'
    | 'image_edit'
    | 'image_variation'
    | 'magic_tool'
    | 'expand_canvas'
    | 'erase_tool'
    | '4k_enhance'
    | 'background_cutout'
    | 'video_generation'
    | 'style_filter'
    | 'rewarded_ad_credit'
    | 'admin_credit_set'
    | 'admin_plan_change';

export interface UsageRecord {
    id: string;
    userId: string;
    featureUsed: TrackableFeatures;
    creditsSpent: number;
    timestamp: string;
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}