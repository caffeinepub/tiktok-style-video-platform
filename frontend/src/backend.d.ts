import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Comment {
    id: string;
    text: string;
    author: Principal;
    timestamp: Time;
    videoId: string;
}
export interface UserProfile {
    bio: string;
    username: string;
    avatarUrl: string;
    followerCount: bigint;
    followingCount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(videoId: string, text: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    follow(userToFollow: Principal): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getComments(videoId: string): Promise<Array<Comment>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likeVideo(videoId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    uploadVideo(id: string, title: string, description: string, duration: bigint, video: ExternalBlob): Promise<void>;
}
