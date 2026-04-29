import React, { ReactNode } from 'react'
import Sidebar from './sidebar'
import Navbar from './navbar'

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = false }) => {
  return (
    <div className='min-h-screen'>
        <div className='flex'>
            {showSidebar && <Sidebar />}

            <div className='flex-1 flex flex-col'>
                <Navbar />

                <main className='flex-1 overflow-y-auto'>{children}</main>
            </div>
        </div>
    </div>
  )
}

export default Layout