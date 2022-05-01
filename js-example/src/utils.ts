import {
    Future,
    Try,
    Avatar,
    AvatarView,
    AvatarFactory,
    AvatarMatrix,
    PeriodicExecutor,
    FPS,
    avatarDataUrlFromKey,
    Col,
    AvatarAnimationData,
    AvatarController,
    Nullable,
    Quaternion,
    Timer,
    Vec3,
    LogLevel,
    Logger,
} from '@0xalter/alter-core'

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const messageElement = document.getElementById('fpsMessage') as HTMLElement

// Only for the dev demo purposes
Logger.logLevel = LogLevel.Debug

export function createAvatar(): [Future<Try<Avatar>>, AvatarView, AvatarFactory] {
    let avatarPresets: Array<AvatarMatrix> = []
    let avatar: Avatar | undefined
    let presetsSwapExecutor: PeriodicExecutor
    let presetIndex = 0
    const fps = new FPS(1.0)

    // Create factory for downloading and creating avatars. Do not forget to get your avatar data key at https://studio.alter.xyz
    // You might want to handle errors more gracefully in your app. We just fail with an error here, as this demo makes little sense without avatars!
    const avatarFactory = AvatarFactory.create(avatarDataUrlFromKey('YOUR-API-KEY-HERE'), canvas).orThrow

    // Wrap a HTML canvas with an AvatarView that handles all avatar rendering and interaction
    const avatarView = new AvatarView(canvas)

    avatarView.setOnFrameListener(() => {
        fps.tick((n) => {
            messageElement.innerHTML = `FPS: ${Math.ceil(n)}`
        })
        if (canvas.clientWidth !== canvas.width || canvas.clientHeight !== canvas.height) {
            canvas.width = canvas.clientWidth
            canvas.height = canvas.clientHeight
        }
    })

    // Create first avatar. Note that loading avatars can take some time (network requests etc.) so we get an asynchronous Future object
    // that resolves when the avatar is ready to display.
    const avatarFuture = avatarFactory.createAvatarFromFile('avatar.json' /*, avatarFactory?.bundledFileSystem*/) // uncomment to load the Avatar matrix from app assets
    avatarFuture?.then(
        (createdAvatar) => {
            avatar = createdAvatar ?? undefined
            avatar?.setBackgroundColor(Col.TRANSPARENT)
            avatarView.avatar = avatar

            const spinner = document.getElementById('spinner')
            if (spinner) {
                spinner.style.display = 'none'
            }
        },
        (error) => console.error(`Failed to create avatar, ${error}`)
    )

    // Load more avatars from ready-made presets and start swapping them around
    avatarFactory
        .parseAvatarMatricesFromFile('presets.json' /*, avatarFactory?.bundledFileSystem*/) // uncomment to load the avatar presets from app assets
        .then(
            (presets) => {
                avatarPresets = presets.toArray()
                if (avatarPresets.length > 0) {
                    presetsSwapExecutor = new PeriodicExecutor(20, () => {
                        const currentPresetIndex = presetIndex
                        console.info(`Updating to avatar preset ${currentPresetIndex}`)
                        avatar
                            ?.updateAvatarFromMatrix(avatarPresets[currentPresetIndex])
                            .then(() => console.log(`Updated to avatar preset ${currentPresetIndex}`))
                        presetIndex = (currentPresetIndex + 1) % avatarPresets.length
                    })
                }
            },
            (error) => console.error(`Failed to load and parse avatar presets, ${error}`)
        )

    return [avatarFuture, avatarView, avatarFactory]
}

/**
 * Very basic avatar animation for demo purposes
 */
export class IdleAnimationAvatarController implements AvatarController {
    private timer = Timer.start()
    frame(): Nullable<AvatarAnimationData> {
        const time = this.timer.tick().elapsed
        const smile = 0.5 + 0.5 * Math.sin(time * 0.5)
        // for the list of available expression, print EXPRESSION_BLENDSHAPES
        return new AvatarAnimationData(
            new Map([
                ['mouthSmile_L', smile],
                ['mouthSmile_R', smile],
            ]),
            AvatarAnimationData.DEFAULT_AVATAR_POSITION,
            Quaternion.fromRotation(0.3 * Math.sin(time * 0.5), Vec3.zAxis),
            Vec3.createWithNum(0.5)
        )
    }
}
