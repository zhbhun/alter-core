import { createAvatar, IdleAnimationAvatarController } from './utils'

// Base avatar management (API initialization, resource loading, presets switching, fps message)
const [_1, avatarView, _2] = createAvatar()
// Show simple animation, face tracking not enabled in this demo
avatarView.avatarController = new IdleAnimationAvatarController()
