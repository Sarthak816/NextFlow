import { ClerkProvider, SignInButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NextFlow - LLM Workflow Builder',
  description: 'Pixel-perfect Krea.ai clone for LLM workflows',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth();

  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className="bg-black text-white min-h-screen">
          <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#000000] z-50 relative h-14 backdrop-blur-md">
            <div className="font-bold text-xl tracking-tight">NextFlow</div>
            <div className="flex gap-4 items-center">
              {!userId ? (
                <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm transition-colors cursor-pointer">
                  <SignInButton />
                </div>
              ) : (
                <UserButton />
              )}
            </div>
          </header>
          <main className="h-[calc(100vh-56px)]">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}
