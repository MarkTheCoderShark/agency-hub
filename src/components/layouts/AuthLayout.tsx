import { Outlet, Link } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b flex items-center px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">AH</span>
          </div>
          <span className="font-semibold text-xl">AgencyHub</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 border-t flex items-center justify-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AgencyHub. All rights reserved.</p>
      </footer>
    </div>
  )
}
