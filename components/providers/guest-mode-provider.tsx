"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const EDIT_PASSWORD = "121";
const GUEST_EDIT_KEY = "vo-tracker-guest-edit-authorized";

interface GuestModeContextType {
    isGuest: boolean;
    isEditAuthorized: boolean;
    showPasswordDialog: boolean;
    pendingAction: (() => void) | null;
    requestEditAccess: (action?: () => void) => void;
    verifyPassword: (password: string) => boolean;
    closePasswordDialog: () => void;
    revokeEditAccess: () => void;
}

const GuestModeContext = createContext<GuestModeContextType | undefined>(undefined);

export function GuestModeProvider({ children }: { children: React.ReactNode }) {
    const { isSignedIn, isLoaded } = useUser();
    const [isEditAuthorized, setIsEditAuthorized] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    // Check if user is a guest (not signed in)
    const isGuest = isLoaded && !isSignedIn;

    // Load edit authorization from session storage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = sessionStorage.getItem(GUEST_EDIT_KEY);
            if (saved === "true") {
                setIsEditAuthorized(true);
            }
        }
    }, []);

    // If user is signed in, they always have edit access
    useEffect(() => {
        if (isSignedIn) {
            setIsEditAuthorized(true);
        }
    }, [isSignedIn]);

    const requestEditAccess = useCallback((action?: () => void) => {
        if (isSignedIn || isEditAuthorized) {
            // Already authorized, execute action immediately
            action?.();
            return;
        }
        // Show password dialog
        setPendingAction(() => action || null);
        setShowPasswordDialog(true);
    }, [isSignedIn, isEditAuthorized]);

    const verifyPassword = useCallback((password: string): boolean => {
        if (password === EDIT_PASSWORD) {
            setIsEditAuthorized(true);
            setShowPasswordDialog(false);
            if (typeof window !== "undefined") {
                sessionStorage.setItem(GUEST_EDIT_KEY, "true");
            }
            // Execute pending action if exists
            if (pendingAction) {
                pendingAction();
                setPendingAction(null);
            }
            return true;
        }
        return false;
    }, [pendingAction]);

    const closePasswordDialog = useCallback(() => {
        setShowPasswordDialog(false);
        setPendingAction(null);
    }, []);

    const revokeEditAccess = useCallback(() => {
        setIsEditAuthorized(false);
        if (typeof window !== "undefined") {
            sessionStorage.removeItem(GUEST_EDIT_KEY);
        }
    }, []);

    return (
        <GuestModeContext.Provider
            value={{
                isGuest,
                isEditAuthorized: isSignedIn || isEditAuthorized,
                showPasswordDialog,
                pendingAction,
                requestEditAccess,
                verifyPassword,
                closePasswordDialog,
                revokeEditAccess,
            }}
        >
            {children}
        </GuestModeContext.Provider>
    );
}

export function useGuestMode() {
    const context = useContext(GuestModeContext);
    if (context === undefined) {
        throw new Error("useGuestMode must be used within a GuestModeProvider");
    }
    return context;
}
