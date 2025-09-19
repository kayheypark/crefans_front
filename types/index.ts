// Export all type definitions for centralized access

// Core API types
export type {
  BaseApiResponse,
  PaginatedApiResponse,
  LikeResponse,
  AuthResponse, // Keep the original AuthResponse from api.ts
  // Avoid conflicts by not exporting SubscriptionResponse and UnsubscriptionResponse
} from './api';

// Domain-specific types (selective exports to avoid conflicts)
export type {
  SignUpRequest,
  SignInRequest,
  SignOutRequest,
  ConfirmSignUpRequest,
  ResendConfirmationCodeRequest,
  ConfirmEmailVerificationRequest,
  UpdateNicknameRequest,
  UpdateHandleRequest,
  UpdateUserProfileRequest,
  UserResponse,
  AuthApiResponse,
  SignUpResponse,
  SignInResponse,
  SignOutResponse,
  ConfirmSignUpResponse,
  ResendConfirmationCodeResponse,
  ConfirmEmailVerificationResponse,
  UpdateNicknameResponse,
  UpdateHandleResponse,
  UpdateUserProfileResponse,
} from './auth';

export * from './comment';
export * from './creator';
export * from './membership';
export * from './payment';
export * from './posting';
export * from './subscription';

// Common utility types
export * from './common';

// Legacy types (for backwards compatibility)
export * from './post';

// Re-export commonly used types with cleaner names
export type {
  BaseApiResponse as ApiResponse,
  PaginatedApiResponse as PaginatedResponse
} from './api';

export type {
  CreatePostingRequest as CreatePosting,
  UpdatePostingRequest as UpdatePosting,
  PostingResponse as Posting
} from './posting';

export type {
  CreateCommentRequest as CreateComment,
  UpdateCommentRequest as UpdateComment,
  Comment
} from './comment';

export type {
  CreatorResponse as Creator,
  CreatorCategoryResponse as CreatorCategory
} from './creator';

export type {
  MembershipResponse as Membership,
  CreateMembershipRequest as CreateMembership
} from './membership';

export type {
  PreparePaymentRequest as PreparePayment,
  ConfirmPaymentRequest as ConfirmPayment,
  PaymentTransactionResponse as PaymentTransaction
} from './payment';

export type {
  SignInRequest as SignIn,
  SignUpRequest as SignUp,
  UserResponse as User
} from './auth';

export type {
  SubscribeMembershipRequest as SubscribeMembership,
  MySubscriptionItem as Subscription
} from './subscription';