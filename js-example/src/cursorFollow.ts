import { AvatarAnimationData, AvatarController, Nullable, Quaternion, Vec3 } from '@0xalter/alter-core'
import { createAvatar } from './utils'

const canvas = document.getElementById('canvas') as HTMLCanvasElement

const mouseRotationSpeed = 1.5
const rotationLimits = {
    x: [-Math.PI / 2, Math.PI / 2],
    y: [-Math.PI / 4, Math.PI / 4],
}

// Base avatar management (API initialization, resource loading, presets switching, fps message)
const [avatarFuture, avatarView, _] = createAvatar()
avatarFuture.then(() => {
    // Use the mouse following controller as avatar animator
    avatarView.avatarController = new MouseFollowAvatarController(canvas)
})

class MouseFollowAvatarController implements AvatarController {
    private mouseRotation: [number, number, number] = [0, 0, 0]
    private eyeLook: { [key: string]: number } = {
        eyeLookUp_L: 0,
        eyeLookOut_L: 0,
        eyeLookIn_L: 0,
        eyeLookDown_L: 0,
        eyeLookDown_R: 0,
        eyeLookIn_R: 0,
        eyeLookOut_R: 0,
        eyeLookUp_R: 0,
    }

    constructor(canvas: HTMLCanvasElement) {
        canvas.addEventListener('mousemove', (event: MouseEvent) => {
            const dx = (event.offsetX - canvas.clientLeft) / canvas.clientWidth - 0.5
            const dy = (event.offsetY - canvas.clientTop) / canvas.clientHeight - 0.4 // make the avatar look slightly down - looks more natural
            this.mouseRotation[0] = clamp(dx * mouseRotationSpeed, rotationLimits.x[0], rotationLimits.x[1])
            this.mouseRotation[1] = clamp(dy * mouseRotationSpeed, rotationLimits.y[0], rotationLimits.y[1])
            this.eyeLook.eyeLookDown_L = this.eyeLook.eyeLookDown_R = Math.max(0, dy * 2)
            this.eyeLook.eyeLookUp_L = this.eyeLook.eyeLookUp_R = Math.max(0, -dy * 2)
            this.eyeLook.eyeLookIn_L = this.eyeLook.eyeLookOut_R = Math.max(0, -dx * 2)
            this.eyeLook.eyeLookIn_L = this.eyeLook.eyeLookOut_R = Math.max(0, dx * 2)
        })
    }

    frame(): Nullable<AvatarAnimationData> {
        // Default avatar position work best in portait mode (mobile), web is usually landscape mode
        const position = AvatarAnimationData.DEFAULT_AVATAR_POSITION.minus(Vec3.createWithFloat(0, 0, 0.4))
        const quaternion = Quaternion.fromEuler(this.mouseRotation[1], this.mouseRotation[0], this.mouseRotation[2])

        return new AvatarAnimationData(new Map(Object.entries(this.eyeLook)), position, quaternion, Vec3.createWithNum(1))
    }
}

function clamp(number: number, from: number, to: number): number {
    return Math.max(from, Math.min(number, to))
}
