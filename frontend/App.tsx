import React from 'react';
import {HashRouter, Navigate, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from './contexts/ThemeContext';
import {ToastProvider} from './contexts/ToastContext';
import SharePage from "./pages/SharePage.tsx";
import Layout from './components/Layout';
import {UserProvider} from './contexts/UserContext';
import {BackendCheckProvider} from "./contexts/BackendCheck.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import uiElements from './components/UiElements';

function App() {
    return (
        <ThemeProvider>
            <ToastProvider>
                <HashRouter>
                    <Routes>
                        <Route path="/share/:id" element={<SharePage/>}/>
                        <Route path="/signup" element={<SignupPage/>}/>
                        <Route path="/*" element={
                            <BackendCheckProvider>

                                <UserProvider>
                                    <Layout>
                                        <Routes>
                                            <Route path="/" element={<Navigate to="/home" replace/>}/>
                                            {uiElements.map(u => (
                                                <React.Fragment key={u.route.path}>
                                                    <Route path={u.route.path} element={u.route.element}/>
                                                </React.Fragment>
                                            ))}
                                        </Routes>
                                    </Layout>
                                </UserProvider>

                            </BackendCheckProvider>
                        }/>
                    </Routes>
                </HashRouter>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;