'use client';

import React from 'react';
import './globals.css';

const Layout = ({ children }) => {
    return (
        <html lang="en">
            <body>
                <div className="layout" id="root">
                    
                    <main className="layout-main">
                        {children}
                    </main>
                    
                </div>  
            </body>
        </html>
    );
};

export default Layout;