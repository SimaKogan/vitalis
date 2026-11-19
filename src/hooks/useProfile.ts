import { DEFAULT_PROFILE, type Profile } from '../lib/calc'
import { useLocalStorage } from './useLocalStorage'

/** The user's body details, saved only in this browser and shared by the calculator, menu and labs pages. */
export function useProfile() {
  const [stored, setProfile] = useLocalStorage<Profile>('vitalis.profile', DEFAULT_PROFILE)
  // older saved data may miss newer fields
  const profile: Profile = { ...DEFAULT_PROFILE, ...stored }
  return [profile, setProfile] as const
}
