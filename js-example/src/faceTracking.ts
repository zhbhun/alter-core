import { CameraWrapper, FaceTracker, TrackerAvatarController } from '@0xalter/alter-core'
import { createAvatar } from './utils'

const videoElement = document.getElementById('videoSource') as HTMLVideoElement
const trackingMessageElement = document.getElementById('trackingMessage') as HTMLElement

// Base avatar management (API initialization, resource loading, presets switching, fps message)
const [avatarFuture, avatarView, avatarFactory] = createAvatar()

const cameraWrapper = new CameraWrapper(videoElement)
const cameraTrackerFuture = FaceTracker.createVideoTracker(avatarFactory.bundledFileSystem)

Promise.all([avatarFuture.promise(), cameraTrackerFuture.promise()]).then(([avatar, faceTracker]) => {
    // Bundled tracking controller handles interaction with webcamera and sends facial expressions to the avatar
    const trackerAvatarController = TrackerAvatarController.create(faceTracker, avatar)

    // Start camera recording or log an error if it fails
    cameraWrapper.start().logError('Error starting camera')
    cameraWrapper.addOnFrameListener((cameraTexture) => {
        // Give the tracking controller a new image to process.
        // AvatarView automatically picks up changes in the controller so no more work needs to be done!
        // You can access the raw tracking data by inspecting the object this method returns.
        const trackerResult = trackerAvatarController.updateFromCamera(cameraTexture)
        if (trackerResult) {
            // Update face detection message based on result of the last tracked camera frame
            trackingMessageElement.innerHTML = trackerResult.hasFace() === false ? 'No face detected' : ''
        }
    })

    // Use the face tracking controller as avatar animator
    avatarView.avatarController = trackerAvatarController
})
