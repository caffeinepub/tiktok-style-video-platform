import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Models
  type UserProfile = {
    username : Text;
    bio : Text;
    avatarUrl : Text;
    followerCount : Nat;
    followingCount : Nat;
  };

  type Video = {
    id : Text;
    title : Text;
    description : Text;
    uploader : Principal;
    uploadTimestamp : Time.Time;
    duration : Nat; // seconds, max 600
    likeCount : Nat;
    commentCount : Nat;
    video : Storage.ExternalBlob;
  };

  type Comment = {
    id : Text;
    videoId : Text;
    text : Text;
    author : Principal;
    timestamp : Time.Time;
  };

  // Persistent State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let videos = Map.empty<Text, Video>();
  let comments = Map.empty<Text, Comment>();
  let follows = Map.empty<Principal, [Principal]>();
  let likes = Map.empty<Text, [Principal]>(); // videoId -> users who liked

  // Private helper: asserts that the given principal has #user permission
  func requireUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };

  // User profile management

  // Only authenticated users can retrieve their own profile
  public query ({ caller }) func getCallerUserProfile() : async UserProfile {
    requireUser(caller);
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  // Only authenticated users can save their own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    requireUser(caller);
    userProfiles.add(caller, profile);
  };

  // Any caller (including guests) can view another user's public profile
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  // Video upload — authenticated users only
  public shared ({ caller }) func uploadVideo(
    id : Text,
    title : Text,
    description : Text,
    duration : Nat,
    video : Storage.ExternalBlob,
  ) : async () {
    requireUser(caller);
    if (duration > 600) {
      Runtime.trap("Video duration exceeds 10 minutes");
    };

    let newVideo : Video = {
      id;
      title;
      description;
      uploader = caller;
      uploadTimestamp = Time.now();
      duration;
      video;
      likeCount = 0;
      commentCount = 0;
    };

    videos.add(id, newVideo);
  };

  // Comment management — posting requires authentication
  public shared ({ caller }) func addComment(
    videoId : Text,
    text : Text,
  ) : async () {
    requireUser(caller);
    let commentId = Time.now().toText();
    let newComment : Comment = {
      id = commentId;
      videoId;
      text;
      author = caller;
      timestamp = Time.now();
    };

    comments.add(commentId, newComment);

    // Update video comment count
    switch (videos.get(videoId)) {
      case (null) { () };
      case (?video) {
        let updatedVideo = { video with commentCount = video.commentCount + 1 };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  // Reading comments is public — no authentication required
  public query func getComments(videoId : Text) : async [Comment] {
    comments.values().toArray().filter(func(c) { c.videoId == videoId }).sort(
      func(a, b) {
        if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) {
          #greater;
        } else { #equal };
      }
    );
  };

  // Follow a user — authenticated users only
  public shared ({ caller }) func follow(userToFollow : Principal) : async () {
    requireUser(caller);
    let currentFollowing = switch (follows.get(caller)) {
      case (null) { [] };
      case (?following) { following };
    };
    if (currentFollowing.find(func(u) { u == userToFollow }) != null) {
      Runtime.trap("Already following user");
    };
    follows.add(caller, currentFollowing.concat([userToFollow]));
  };

  // Like a video — authenticated users only
  public shared ({ caller }) func likeVideo(videoId : Text) : async () {
    requireUser(caller);
    let currentLikes = switch (likes.get(videoId)) {
      case (null) { [] };
      case (?likedUsers) { likedUsers };
    };
    if (currentLikes.find(func(u) { u == caller }) != null) {
      Runtime.trap("Video already liked");
    };

    let newLikes = currentLikes.concat([caller]);
    likes.add(videoId, newLikes);

    // Update video like count
    switch (videos.get(videoId)) {
      case (null) { () };
      case (?video) {
        let updated = { video with likeCount = video.likeCount + 1 };
        videos.add(videoId, updated);
      };
    };
  };
};
