// no default React import needed with react-jsx runtime
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/use-toast'

export function AuthButton() {
  const { user, loading, signInWithGoogle, signInWithGitHub, signOut } = useAuth()
  const { toast } = useToast()

  const handleSignIn = async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') {
        await signInWithGoogle()
      } else {
        await signInWithGitHub()
      }
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-2 rounded bg-secondary animate-pulse">
        Loading...
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {user.email}
        </span>
        <button
          onClick={handleSignOut}
          className="px-3 py-2 rounded bg-secondary hover:bg-secondary/80 text-sm"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleSignIn('google')}
        className="px-3 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 text-sm"
      >
        Sign in with Google
      </button>
      <button
        onClick={() => handleSignIn('github')}
        className="px-3 py-2 rounded border hover:bg-secondary text-sm"
      >
        Sign in with GitHub
      </button>
    </div>
  )
}
