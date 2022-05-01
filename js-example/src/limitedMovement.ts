import {
    AvatarAnimationData,
    AvatarController,
    AvatarRenderer,
    CameraWrapper,
    FaceTracker,
    Nullable,
    Quaternion,
    TrackerAvatarController,
} from '@0xalter/alter-core'
import { createAvatar } from './utils'

const videoElement = document.getElementById('videoSource') as HTMLVideoElement

// Base avatar management (API initialization, resource loading, presets switching, fps message)
const [avatarFuture, avatarView, avatarFactory] = createAvatar()

const cameraWrapper = new CameraWrapper(videoElement)
const cameraTrackerFuture = FaceTracker.createVideoTracker(avatarFactory.bundledFileSystem)

Promise.all([avatarFuture.promise(), cameraTrackerFuture.promise()]).then(([avatar, faceTracker]) => {
    // Use the mouse following controller as avatar animator
    avatarView.avatarController = new BoundedCameraTracker(avatar, faceTracker, cameraWrapper)
})

class BoundedCameraTracker implements AvatarController {
    // Face tracking controller will be used to resolve face tracking results from each camera frame
    // The tracking result will be altered in our way before passed for rendering
    private trackerAvatarController: TrackerAvatarController

    constructor(avatar: AvatarRenderer, faceTracker: FaceTracker, cameraWrapper: CameraWrapper) {
        this.trackerAvatarController = TrackerAvatarController.create(faceTracker, avatar)

        // Start camera recording or log an error if it fails
        cameraWrapper.start().logError('Error starting camera')
        // For each camera frame evaluate face tracking result through tracking controller instance
        cameraWrapper.addOnFrameListener((cameraTexture) => this.trackerAvatarController.updateFromCamera(cameraTexture))
    }

    frame(): Nullable<AvatarAnimationData> {
        // Pick up the last face tracking result data
        let trackingData = this.trackerAvatarController.frame()
        if (trackingData) {
            const rotation = trackingData.rotation.toEuler()
            // Limit the horizontal rotation to range from -22.5 deg to 22.5 deg
            const limitedRotation = Quaternion.fromEuler(rotation.withY(clamp(rotation.y, -Math.PI / 8, Math.PI / 8)))
            trackingData = trackingData.withPosition(trackingData.position, limitedRotation, trackingData.scale, 0)
        }
        return trackingData
    }
}

function clamp(number: number, from: number, to: number): number {
    return Math.max(from, Math.min(number, to))
}
