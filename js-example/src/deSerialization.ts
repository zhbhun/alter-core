import {
    Avatar,
    CameraWrapper,
    FaceTracker,
    FaceTrackerResultDeserializer,
    FaceTrackerResultSerializer,
    TrackerResultAvatarController,
} from '@0xalter/alter-core'
import { createAvatar } from './utils'

const videoElement = document.getElementById('videoSource') as HTMLVideoElement

// Base avatar management (API initialization, resource loading, presets switching, fps message)
const [avatarFuture, avatarView, avatarFactory] = createAvatar()

const cameraWrapper = new CameraWrapper(videoElement)
const cameraTrackerFuture = FaceTracker.createVideoTracker(avatarFactory.bundledFileSystem)

Promise.all([avatarFuture.promise(), cameraTrackerFuture.promise()]).then(([avatar, faceTracker]) => {
    // Set deserialization controller as avatar animator
    // The instance has to be created before first message is sent (serialization format),
    // otherwise the message will not be recieved and deserialization won't work properly
    // This very simple demo logic should be replaced with proper network protocol behavior
    avatarView.avatarController = new DeserializationAvatarController(avatar)

    // Serializer will provide serialization format and allow to serialize tracking result data
    const serializer = FaceTrackerResultSerializer.create()

    // First send the serialization format that is necessary for creation of the deserializer instance
    // Send serialization format over WebRTC or WebSockets
    // This demo example simulates that with custom browser events
    dispatchEvent(new CustomEvent('serializationFormat', { detail: serializer.serializationFormat }))

    // Start camera recording or log an error if it fails
    cameraWrapper.start().logError('Error starting camera')
    // For each camera frame evaluate face tracking result through face tracker
    // Because the tracking result is not applied directly to avatar
    // TrackerAvatarController doesn't have to be used, face tracker instance is sufficient
    cameraWrapper.addOnFrameListener((cameraTexture) => {
        const trackResult = faceTracker.track(cameraTexture)
        if (trackResult) {
            // Send serialized tracking result over WebRTC or WebSockets
            // This demo example simulates that with custom browser events
            dispatchEvent(new CustomEvent('serializedData', { detail: serializer.serialize(trackResult) }))
        }
    })
})

/**
 * Avatar animation controller based on bundled helper controller
 * Receives custom browser events with serialization format and subsequent serialized tracking data
 * and animates the avatar based on deserialized results
 */
class DeserializationAvatarController extends TrackerResultAvatarController {
    private deserializer: FaceTrackerResultDeserializer | undefined

    constructor(avatar: Avatar) {
        super(avatar)

        const initListener = (eventKey: string, onEvent: (e: CustomEvent) => void) =>
            addEventListener(eventKey, ((e: CustomEvent) => onEvent(e)) as EventListener)

        // Instantiate deserializer with serialization format when received
        initListener('serializationFormat', (e) => (this.deserializer = FaceTrackerResultDeserializer.create(e.detail)))
        // Use TrackerResultAvatarController base class method update() to animate the avatar based on received tracking data
        initListener('serializedData', (e) => this.update(this.deserializer?.deserialize(e.detail).trackerResult))
    }
}
