# Changelog
All notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.14.5 - 2022-06-07
### Fixed
- Prefer front-facing cameras on JS when frontFacing is set to true in CameraWrapper
- Better conflict resolution in avatar designer logic

## 0.14.4 - 2022-05-29
### Fixed
- Transparent background not working properly on iOS
- Crash when CameraWrapper was used from multiple threads on iOS
- deviceId parameter in CameraWrapper.start being ignored on JS

## 0.14.3 - 2022-05-23
### Fixed
- Cached files getting occasionally corrupted on iOS

## 0.14.2 - 2022-05-23
### Changed
- Updated default data URL to a new version

## 0.14.1 - 2022-05-23
### Fixed
- Wrong paths in Swift PM dependencies

## 0.14.0 - 2022-05-22
### Added
- CameraTrackerController that connects CameraWrapper and TrackerAvatarController in one convenient object
- ViewportFitAvatarController that makes sure the avatar always fits in the given viewport
- AnimatingAvatarController that allows driving the avatar from a keyframe animation
- RecordingAvatarController that allows recording a keyframe animation for AnimatingAvatarController
- pause/resumeRendering is available on AvatarView on all platforms

### Fixed
- Inconsistencies in designer logic
- Unnecessary test code and resources being included in the production build
- Javascript APIs not properly accepting JS Maps/objects as parameters

### Changed
- CameraWrapper methods on iOS do not require named parameters anymore (in line with the rest of the API)

## 0.13.0 - 2022-05-03
### Added
- SerializingTrackerAvatarController and DeserializingTrackerAvatarController to support a simple integration of the face tracker result serialization
- Optional avatar data versioning to `avatarDataUrlFromKey`
- Added APIs for creating custom avatar designers (`AvatarLogic` and `ConfigurableAvatarLogic`)

### Fixed
- Updated face tracker result serialization to work around a Protocol buffers serializer bug, previous serialization version is deprecated and will become unsupported in time
- Overload resolution bugs on Javascript
- Memory leaks and excessive memory usage, especially on iOS

## 0.12.0 - 2022-03-22
### Fixed
- Fixed a regression from 0.11.0 that caused a crash in video recording on iOS

## 0.11.0 - 2022-03-21
### Added
- Protocol-buffers-based face tracker result serialization
- Replaces deprecated functions FaceTrackerResult.serialize() and deserializeResult()

### Fixed
- Memory leaks when loading multiple avatars
- Stuttering on iOS
- Screenshot not working on Javascript
- FallbackAvatarController not transitioning smoothly between primary and fallback phase
- Swift package manager not working with Xcode 13.3
- Avatar loading getting stuck on older iOS devices

## 0.10.0 - 2022-02-01
### Added
- New classes for accessing camera on iOS and Javascript

### Changed
- Changing name from Facemoji to Alter
- The SDK is now publicly available

### Fixed
- (iOS) Multiple memory leaks on iOS
- (iOS) Multiple thread synchronization issues on iOS
- Accessory collisions for avatars
- Assets not properly updated from Alter servers

### Improved
- (JS) NN loading performance
- (JS) Avatar loading performance

## 0.9.0 - 2022-01-05
### Fixed
- Javascript implementation is now up to 3x faster
- Improve error messages for avatar loading

### Added
- New simplified Avatar API to avoid the need to create contexts and multiple helper objects

### Changed
- Re-worked Javascript API to be on-par with Android and iOS

## 0.8.0 - 2021-11-30
### Fixed
- Fix face tracker limiting rendering performance
- (iOS) Workaround for device crash on Apple A8 chipsets (iPad Air 2, iPad Mini 4, iPhone 6)
- (iOS) Reduce peak memory usage
- (iOS) Cache compiled neural net models to speed up startup and reduce disk usage
- (iOS) Improve neural net loading to avoid hiccups in first few frames

### Changed
- (JS) Removed co.facemoji* prefix from API classes
- (JS) Improve Typescript typings

## 0.7.7 - 2021-11-24
### Changed
- (JS) API now allows to limit avatar tracking only to rotation

## 0.7.6 - 2021-11-19
### Fixed
- (JS) Fix JS overload renames being applied to external definitions

## 0.7.5 - 2021-11-18
### Changed
- Redesign boneblender computation to be more predictable

## 0.7.4 - 2021-11-16
### Fixed
- (JS) NN data path respects base data location configuration

